<script lang="ts">
  import { onMount, setContext, tick } from 'svelte';
  import style from './style.module.css';
  import { writable } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { _clamp, wrapAround, type IContext } from './helpers';

  const TRANSITION_MS = 300;

  export let showDebug = true;
  export let itemsGap = 0;
  export let slidesPerView = 1;
  export let centerSlide = false;
  export let fadeOnMount = true;
  export let loop = true;

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

  type SlideInfo = {
    offset: number;
    start: number;
    end: number;
    width: number;
  };

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

      // Looping is handled by positioning last slide before first on when needed and so on
      // So to go from last slide to first we immediatelly jump to -1 slide, which is repositioned last and then transition to first real one
      const currentWrapped = wrapped - (n - $currentSlide);
      currentSlide.set(currentWrapped);
      updateOffsetFromCurrentSlide(true);
      currentSlide.set(wrapped);
    }
    updateOffsetFromCurrentSlide(false);
  };

  // Number of pixels we move out slides
  const currentOffset = tweened<number>(undefined, {
    easing: cubicOut,
    duration: TRANSITION_MS,
  });

  const updateOffsetFromCurrentSlide = (immeditate?: boolean) => {
    if (!$slidesInfo.length) return;

    // Again we wrap "fake" slides to real ones
    const wrapped = wrapAround($currentSlide, 0, $totalSlides - 1);

    // Calculate how much do we need to offset
    const extra =
      $currentSlide < 0
        ? -$totalSize
        : $currentSlide > $totalSlides - 1
        ? $totalSize
        : 0;

    const off = $slidesInfo[wrapped].offset + extra;

    if (immeditate) {
      currentOffset.set(off, { duration: 0 });
    } else {
      currentOffset.set(off);
    }
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

    if (loop) {
      if (offset < 0 - $slidesInfo[0].width / 2) {
        offset += $totalSize;
      } else if (
        offset >
        $totalSize - $slidesInfo[$slidesInfo.length - 1].width / 2
      ) {
        offset -= $totalSize;
      }
    }

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

    // const wrappedOffset = wrapAround($currentOffset, 0, $totalSize);
    const wrappedOffset = $currentOffset;

    const speed = (offsetBase - wrappedOffset) / moveTookS;
    const startPositons = $slidesInfo.map((v) => v.offset);

    // Finding Closest slide to where we ended up
    let minIndex = 0;
    let minValue = Infinity;
    for (let i = 0; i < startPositons.length; i++) {
      const v = startPositons[i];

      // Because of looping we consider also slides in +-1 loops
      const minV = Math.min(
        Math.abs(v - wrappedOffset),
        Math.abs(v + $totalSize - wrappedOffset),
        Math.abs(v - $totalSize - wrappedOffset)
      );
      if (minV < (minValue || Infinity)) {
        minIndex = i;
        minValue = minV;
      }
    }

    changeSlideValueAndUpdate(minIndex);

    currentOffset.set(wrappedOffset, { duration: 0 });

    updateOffsetFromCurrentSlide();

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

{#if showDebug}
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
