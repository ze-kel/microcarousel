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
  const slideWidth = writable<number>();
  const currentSlide = writable(0);
  const totalSlides = writable(0);
  const isLoop = writable(loop);
  const gap = writable(itemsGap);
  const slidesMaxWidth = writable<number[]>([]);

  $: gap.set(itemsGap);

  // slideWidth
  const carouselWidth = writable<number | null>(null);

  // Offset we need to set for us to be at each slide

  type SlideInfo = {
    start: number;
    end: number;
  };

  const slidesInfo = writable<SlideInfo[]>([]);

  const calculateSlideInfo = () => {
    if (typeof $carouselWidth !== 'number' || !slideWidth) return [];

    let accumulation = 0;
    const si = [];

    const sw = $slidesMaxWidth;
    for (let i = 0; i < $totalSlides; i++) {
      const currentSlideWidthMax = typeof sw[i] === 'number' ? sw[i] : Infinity;

      const slideW = Math.floor(Math.min(currentSlideWidthMax, $slideWidth));

      let res = accumulation;

      if (centerSlide) {
        res = res - ($carouselWidth - slideW) / 2;
      }

      si.push({ start: res, width: slideW, end: res + slideW });
      accumulation += slideW + $gap;
    }

    slidesInfo.set(si);
  };

  slideWidth.subscribe(calculateSlideInfo);
  slidesMaxWidth.subscribe(calculateSlideInfo);
  carouselWidth.subscribe(calculateSlideInfo);

  const updateSlideWidth = () => {
    if (!$carouselWidth) return;
    const gaps = itemsGap * (Math.ceil(slidesPerView) - 1);
    slideWidth.set(($carouselWidth - gaps) / slidesPerView);
  };

  carouselWidth.subscribe(updateSlideWidth);

  onMount(() => {
    const getW = () => {
      if (!carouselRef) return;
      const { width } = carouselRef.getBoundingClientRect();
      carouselWidth.set(width);
    };
    getW();
    window.addEventListener('resize', getW);
  });

  const changeSlideValueAndUpdate = async (n: number) => {
    const clamped = _clamp(n, 0, $totalSlides - 1);

    if (!$isLoop || clamped === n) {
      currentSlide.set(clamped);
    } else {
      const wrapped = wrapAround(n, 0, $totalSlides - 1);

      const currentWrapped = wrapped - (n - $currentSlide);

      currentSlide.set(currentWrapped);
      console.log('set', currentWrapped);
      updateOffset(true);
      //await tick();
      currentSlide.set(wrapped);
    }
    updateOffset(false);
  };

  // curentOffset + slideControl
  const moveSlide = (nSlides: number) => {
    changeSlideValueAndUpdate($currentSlide + nSlides);
  };

  const currentOffset = tweened<number>(undefined, {
    easing: cubicOut,
    duration: TRANSITION_MS,
  });

  const updateOffset = (immeditate?: boolean) => {
    if (!$slidesInfo.length) return;

    const wrapped = wrapAround($currentSlide, 0, $totalSlides - 1);

    const extra =
      $currentSlide < 0
        ? -$totalSize
        : $currentSlide > $totalSlides - 1
        ? $totalSize
        : 0;

    const off = $slidesInfo[wrapped].start + extra;

    if (immeditate) {
      currentOffset.set(off, { duration: 0 });
    } else {
      currentOffset.set(off);
    }
  };

  slideWidth.subscribe(() => updateOffset());
  slidesInfo.subscribe(() => updateOffset());

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

  // Total size of content
  const totalSize = writable(0);
  slidesInfo.subscribe((v) => {
    if (v.length) {
      totalSize.set(v[v.length - 1].end - v[0].start + $gap);
    }
  });

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
      if (offset < 0) {
        offset += $totalSize;
      } else if (offset > $totalSize - $carouselWidth) {
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

  const findClosestIndex = (array: number[], number: number) =>
    array.reduce(
      (prev, _, currIndex, array) =>
        Math.abs(array[currIndex] - number) < Math.abs(array[prev] - number)
          ? currIndex
          : prev,
      0
    );

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

    const wrappedOffset = wrapAround($currentOffset, 0, $totalSize);

    const speed = (offsetBase - wrappedOffset) / moveTookS;
    const startPositons = $slidesInfo.map((v) => v.start);

    // Closes to where we ended up
    const closestBase = findClosestIndex(startPositons, wrappedOffset);

    // Closes with added inertia(very approx simulation)
    const withInertia = findClosestIndex(startPositons, wrappedOffset - speed);

    // Go to closes with inertia, but at most +-1 from closest to where we ended up
    changeSlideValueAndUpdate(
      _clamp(withInertia, closestBase - 1, closestBase + 1)
    );

    currentOffset.set(wrappedOffset, { duration: 0 });

    updateOffset();

    offsetBase = null;
    moveBase = null;
    moveStartTime = null;
  };

  const context: IContext = {
    slideWidth,
    currentSlide,
    currentOffset,
    moveSlide,
    gap,
    mouseDownHandler,
    mouseUpHandler: finishMove,
    mouseMoveHandler,
    touchEndHandler: finishMove,
    touchCancelHandler: finishMove,
    touchStartHandler,
    touchMoveHandler,
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
