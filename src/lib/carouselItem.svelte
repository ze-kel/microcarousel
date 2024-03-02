<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';

  import style from './style.module.css';
  import type { IContext } from './helpers';

  export let maxWidth = Infinity;

  const ctx = getContext('microcarouselData');

  if (!ctx) {
    console.error('ERROR: <CarouselItem> Must be a child of <Carousel>');
  }

  const {
    slideWidth,
    totalSlides,
    carouselWidth,
    gap,
    currentOffset,
    slidesInfo,
    slidesMaxWidth,
    totalSize,
  } = ctx as IContext;

  totalSlides.set($totalSlides + 1);

  let myRef: HTMLElement;

  let myIndex: number;

  const getW = () => {
    if (!myRef || !myRef.parentNode) return;
    const myIndex = Array.from(myRef.parentNode.children).indexOf(myRef);
    $slidesMaxWidth[myIndex] = maxWidth ? maxWidth : null;
  };

  onMount(() => {
    getW();
    addEventListener('resize', getW);

    if (!myRef || !myRef.parentNode) return;
    myIndex = Array.from(myRef.parentNode.children).indexOf(myRef);
  });

  onDestroy(() => {
    removeEventListener('resize', getW);
    const old = $slidesMaxWidth;

    old.splice(myIndex, 0);
    $slidesMaxWidth = old;
    totalSlides.set($totalSlides - 1);
  });

  $: widthStyle = $slideWidth
    ? `width:${Math.min($slideWidth, maxWidth)}px;`
    : '';

  $: isLeftSide = $currentOffset + $carouselWidth < $totalSize / 2;

  $: amIOnLeftSide = myIndex < $totalSlides / 2;

  $: amIVisible =
    $slidesInfo && $slidesInfo[myIndex]
      ? $currentOffset + $carouselWidth >= $slidesInfo[myIndex].start &&
        $currentOffset <= $slidesInfo[myIndex].end
      : true;

  $: moveStyle = `transform: translateX(${
    isLeftSide !== amIOnLeftSide ? (isLeftSide ? -$totalSize : $totalSize) : 0
  }px);`;
</script>

<div
  bind:this={myRef}
  class={style.carouselItem}
  style="oveflow: hidden; {widthStyle} {amIVisible ? '' : moveStyle}"
>
  {$totalSize}
  {isLeftSide}
  {amIVisible}
  <slot />
</div>
