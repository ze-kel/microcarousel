<script lang="ts">
  import { onMount, setContext, tick } from 'svelte';
  import style from './style.module.css';
  import { writable } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { _clamp, wrapAround, type IContext, type SlideInfo } from './helpers';

  const TRANSITION_MS = 300;

  export let showDebug = false;
  export let itemsGap = 0;
  export let slidesPerView = 1;
  export let centerSlide = false;
  export let fadeOnMount = true;
  export let loop = false;

  let isMounted = !fadeOnMount;

  onMount(async () => {
    isMounted = true;
  });

  // Refs
  let carouselRef: HTMLElement;

  // Context values
  // Index of current slide
  const currentSlide = writable(0);
  // Total number of slides.
  const totalSlides = writable(0);
  // Wrap these in writeable because I pass them to context
  const isLoop = writable(loop);
  const gap = writable(itemsGap);
  // MaxWidth value from all carouselItem-s
  const slidesMaxWidth = writable<number[]>([]);
  $: gap.set(itemsGap);
  // Width of our carousel(space on a page it occupies, not total size of all items)
  const carouselWidth = writable<number | null>(null);

  onMount(() => {
    const getW = () => {
      if (!carouselRef) return;
      const { width } = carouselRef.getBoundingClientRect();
      carouselWidth.set(width);
    };
    getW();
    window.addEventListener('resize', getW);
  });

  // Desired slide width according to slidesPerView. Actual width = min(slideWidth, maxWidth from carouselItem)
  const slideWidth = writable<number>();

  const updateSlideWidth = () => {
    if (!$carouselWidth) return;
    const gaps = itemsGap * (Math.ceil(slidesPerView) - 1);
    slideWidth.set(($carouselWidth - gaps) / slidesPerView);
  };

  carouselWidth.subscribe(updateSlideWidth);

  // Calculates info about start\end(in offset values and width
  const slidesInfo = writable<SlideInfo[]>([]);
  const calculateSlideInfo = () => {
    if (typeof $carouselWidth !== 'number' || !slideWidth) return [];

    let acc = 0;
    const si = [];

    const sw = $slidesMaxWidth;
    for (let i = 0; i < $totalSlides; i++) {
      const currentSlideWidthMax = typeof sw[i] === 'number' ? sw[i] : Infinity;
      const slideW = Math.floor(Math.min(currentSlideWidthMax, $slideWidth));

      let offset = acc;
      let start = offset - $carouselWidth;
      let end = start + slideW + $carouselWidth;

      // If slides are centered then we account for that
      if (centerSlide) {
        offset = offset - ($carouselWidth - slideW) / 2;
      }

      si.push({ start: start, offset, width: slideW, end });
      acc += slideW + $gap;
    }

    slidesInfo.set(si);
  };

  slideWidth.subscribe(calculateSlideInfo);
  slidesMaxWidth.subscribe(calculateSlideInfo);
  carouselWidth.subscribe(calculateSlideInfo);

  // Total size of content. All slides width and combined
  const totalSize = writable(0);
  slidesInfo.subscribe((v) => {
    if (v.length) {
      totalSize.set(
        v[v.length - 1].offset + v[v.length - 1].width - v[0].offset + $gap
      );
    }
  });

  // Set slide to slide with index n
  const changeSlideValueAndUpdate = async (n: number) => {
    const clamped = _clamp(n, 0, $totalSlides - 1);

    if (!$isLoop || clamped === n) {
      currentSlide.set(clamped);
    } else {
      // Case where we want to set slide to -1 or +1 from the end
      const wrapped = wrapAround(n, 0, $totalSlides - 1);
      currentSlide.set(wrapped);
    }
    updateOffsetFromCurrentSlide(false);
  };

  // Number of pixels we move out slides
  const currentOffset = tweened<number>(0, {
    easing: cubicOut,
    duration: TRANSITION_MS,
  });

  const updateOffsetFromCurrentSlide = (immeditate?: boolean) => {
    if (!$slidesInfo.length) return;

    // Again we wrap "fake" slides to real ones
    const wrapped = wrapAround($currentSlide, 0, $totalSlides - 1);

    const current = $currentOffset;
    const target = $slidesInfo[wrapped].offset;

    if (immeditate) {
      currentOffset.set(target, { duration: 0 });
    }

    // Direct, through 0, through $totalSize
    const possibleMoves = [
      [current, target],
      [wrapAround(current, 0, $totalSize), target],
      [0 - ($totalSize - current), target],
    ];

    const shortestMoveIndex = possibleMoves.reduce((a, b, index, arr) => {
      const aR = Math.abs(arr[a][0] - arr[a][1]);
      const bR = Math.abs(arr[index][0] - arr[index][1]);
      return aR < bR ? a : index;
    }, 0);

    const shortestMove = possibleMoves[shortestMoveIndex];

    currentOffset.set(shortestMove[0], { duration: 0 });
    currentOffset.set(shortestMove[1]);
  };

  slideWidth.subscribe(() => updateOffsetFromCurrentSlide());
  slidesInfo.subscribe(() => updateOffsetFromCurrentSlide());

  // Moving Handlers
  let isMoving = false;
  let offsetBase: number | null = null;
  let moveBase: number | null = null;
  let moveStartTime: Date | null = null;

  const moveStart = (position: number) => {
    isMoving = true;
    offsetBase = $currentOffset;
    moveBase = position;
    moveStartTime = new Date();
  };

  const moveHandler = (position: number) => {
    if (
      typeof offsetBase !== 'number' ||
      typeof moveBase !== 'number' ||
      typeof $carouselWidth !== 'number'
    ) {
      console.error(
        'Move handler called without offsetbase or movebase or carouselWidth'
      );
      return;
    }

    let offset = offsetBase + (moveBase - position);

    currentOffset.set(offset, { duration: 0 });
  };

  const mouseDownHandler = (e: MouseEvent) => {
    e.preventDefault();
    moveStart(e.clientX);
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    if (!isMoving) return;
    e.preventDefault();
    moveHandler(e.clientX);
  };

  const touchStartHandler = (e: TouchEvent) => {
    const first = e.touches[0];
    moveStart(first.clientX);
  };

  const touchMoveHandler = (e: TouchEvent) => {
    if (!isMoving) return;
    e.preventDefault();
    const first = e.touches[0];
    moveHandler(first.clientX);
  };

  const finishMove = (e: Event) => {
    if (!isMoving) return;
    e.preventDefault();
    e.stopPropagation();

    if (typeof moveStartTime !== 'object' || typeof offsetBase !== 'number') {
      console.error('finishMove called without offsetbase or moveStartTime');
      return;
    }

    const finishTime = new Date();
    const moveTookS = (Number(finishTime) - Number(moveStartTime)) / 1000;

    isMoving = false;

    const speed = (offsetBase - $currentOffset) / moveTookS;

    const offset = $currentOffset;

    const startPositons = $slidesInfo.map((v) => v.offset);

    // Finding Closest slide to where we ended up
    let minIndex = 0;
    let minValue = Infinity;

    for (let i = 0; i < startPositons.length; i++) {
      const v = startPositons[i];

      // Because of looping we consider also slides in +-1 loops
      const minV = Math.min(
        Math.abs(v - offset),
        ...($isLoop
          ? [
              Math.abs(v + $totalSize - offset),
              Math.abs(v - $totalSize - offset),
            ]
          : [])
      );
      if (minV < (minValue || Infinity)) {
        minIndex = i;
        minValue = minV;
      }
    }

    const speedDirection = speed > 0 ? -1 : 1;
    const speedModifirer =
      minIndex === $currentSlide && Math.abs(speed) > 500 ? 1 : 0;

    changeSlideValueAndUpdate(minIndex + speedDirection * speedModifirer);

    offsetBase = null;
    moveBase = null;
    moveStartTime = null;
  };

  const context: IContext = {
    slideWidth,
    currentSlide,
    currentOffset,
    gap,
    mouseDownHandler,
    mouseUpHandler: finishMove,
    mouseMoveHandler,
    touchEndHandler: finishMove,
    touchCancelHandler: finishMove,
    touchStartHandler,
    touchMoveHandler,
    changeSlideValueAndUpdate,
    totalSlides,
    slidesMaxWidth,
    slidesPerView,
    carouselWidth,
    isLoop,
    slidesInfo,
    totalSize,
  };

  // Context provide
  setContext('microcarouselData', context);
</script>

{#if true}
  <div style="display: grid; grid-template-column: 1fr 1fr;">
    <span>currentSlide</span>
    <span> {$currentSlide}</span>
    <span> currentOffset </span>
    <span> {$currentOffset}</span>
    <span>slidewidth</span>
    <span>{$slideWidth}</span>

    <span> carouselwidth</span> <span>{$carouselWidth}</span>

    {$totalSize}

    <span>{JSON.stringify($slidesInfo)}</span>
  </div>
{/if}
<div
  bind:this={carouselRef}
  class={style.carousel}
  style="opacity: {isMounted ? 1 : 0};"
>
  <slot />
</div>
