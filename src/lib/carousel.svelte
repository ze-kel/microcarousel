<script lang="ts">
  import { onMount, setContext, tick } from 'svelte';
  import style from './style.module.css';
  import { writable } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const _clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(v, max));

  const TRANSITION_MS = 300;

  export let showDebug = true;
  export let itemsGap = 0;
  export let slidesPerView: number | 'fit' = 1;
  export let centerSlide = false;
  export let fadeOnMount = true;

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
  const gap = writable(itemsGap);
  const childSizes = writable<number[]>([]);

  $: gap.set(itemsGap);

  // slideWidth
  const carouselWidth = writable<number | null>(null);

  let slidePositions: number[] = [];

  const calculateSlidePositions = () => {
    if (typeof $carouselWidth !== 'number' || !slideWidth) return [];

    let accumulation = 0;
    const sls = [];

    const sw = $childSizes;
    for (let i = 0; i < $totalSlides; i++) {
      const currentSlideWidth = slidesPerView === 'fit' ? sw[i] : $slideWidth;

      let res = accumulation;

      if (centerSlide) {
        res = res - ($carouselWidth - currentSlideWidth) / 2;
      }

      sls.push(res);
      accumulation += currentSlideWidth + $gap;
    }

    console.log('sls', sls);
    return sls;
  };

  const refreshSlidePositions = () => {
    slidePositions = calculateSlidePositions();
  };

  slideWidth.subscribe(refreshSlidePositions);
  childSizes.subscribe(refreshSlidePositions);
  carouselWidth.subscribe(refreshSlidePositions);

  const updateSlideWidth = () => {
    if (!$carouselWidth) return;
    const spv = slidesPerView === 'fit' ? 1 : slidesPerView;
    const gaps = itemsGap * (Math.ceil(spv) - 1);
    slideWidth.set(($carouselWidth - gaps) / spv);
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

  const changeSlideValueAndUpdate = (n: number, immeditate?: boolean) => {
    currentSlide.set(_clamp(n, 0, $totalSlides - 1));
    updateOffset(immeditate);
  };

  const goToSlide = (n: number) => {
    changeSlideValueAndUpdate(n);
  };

  // curentOffset + slideControl
  const moveSlide = (nSlides: number) => {
    goToSlide($currentSlide + nSlides);
  };

  const currentOffset = tweened<number>(undefined, {
    easing: cubicOut,
    duration: TRANSITION_MS,
  });

  const updateOffset = (immeditate?: boolean) => {
    if (!slidePositions) return;

    if (immeditate) {
      currentOffset.set(slidePositions[$currentSlide], { duration: 0 });
    } else {
      currentOffset.set(slidePositions[$currentSlide]);
    }
  };

  slideWidth.subscribe(() => updateOffset());
  $: slidePositions, updateOffset();

  const convertOffsetToSlideWithInertia = (currentSpeed: number) => {
    // Closes to where we ended up
    const closestBase = slidePositions.reduce(
      (prev, _, currIndex, array) =>
        Math.abs(array[currIndex] - $currentOffset) <
        Math.abs(array[prev] - $currentOffset)
          ? currIndex
          : prev,
      0
    );

    // Simulate some inertia
    const withInertia = $currentOffset - currentSpeed;

    const closest = slidePositions.reduce(
      (prev, _, currIndex, array) =>
        Math.abs(array[currIndex] - withInertia) <
        Math.abs(array[prev] - withInertia)
          ? currIndex
          : prev,
      0
    );

    // Go to closes with inertia, but at most +-1 from closest to where we ended up
    goToSlide(_clamp(closest, closestBase - 1, closestBase + 1));

    updateOffset();
  };

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
    console.log('movestart', offsetBase, moveBase);
  };

  const mouseDownHandler = (e: MouseEvent) => {
    console.log('mousedown');
    e.preventDefault();
    moveStart(e.clientX);
  };

  const moveHandler = (positon: number) => {
    if (typeof offsetBase !== 'number' || typeof moveBase !== 'number') {
      console.error('Move handler called without offsetbase or movebase');
      return;
    }

    currentOffset.set(offsetBase + (moveBase - positon), { duration: 0 });
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

    const speed = (offsetBase - $currentOffset) / moveTookS;

    isMoving = false;
    convertOffsetToSlideWithInertia(speed);

    offsetBase = null;
    moveBase = null;
    moveStartTime = null;
  };

  const context = {
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
    childSizes,
    slidesPerView,
    carouselWidth,
  };

  // Context provide
  setContext('microcarouselData', context);

  $: overflowLeft = $currentOffset < 0;
</script>

{#if showDebug}
  <div style="display: grid; grid-template-column: 1fr 1fr;">
    <span>currentSlide</span>
    <span> {$currentSlide}</span>
    <span> currentOffset </span>
    <span> {$currentOffset}</span>
    <span>slidewidth</span>
    <span>{$slideWidth}</span>
    totalSlides {$totalSlides}

    <span> carouselwidth</span> <span>{$carouselWidth}</span>

    {$childSizes}

    <span>overflowLeft</span>
    <span>{overflowLeft}</span>
  </div>
{/if}
<div
  bind:this={carouselRef}
  class="{style.carousel} {slidesPerView === 'fit' ? style.fit : ''}"
  style="opacity: {isMounted ? 1 : 0};"
>
  <slot />
</div>
