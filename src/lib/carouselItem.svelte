<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';

  import style from './style.module.css';
  import type { Writable } from 'svelte/store';

  let max = 300;

  const ctx = getContext('microcarouselData');

  if (!ctx) {
    console.error('ERROR: <CarouselItem> Must be a child of <Carousel>');
  }

  const { slideWidth, totalSlides, childSizes, carouselWidth } = ctx as {
    slideWidth: Writable<number>;
    totalSlides: Writable<number>;
    childSizes: Writable<number[]>;
  };

  totalSlides.set($totalSlides + 1);

  let myRef: HTMLElement;

  const getW = () => {
    if (!myRef || !myRef.parentNode) return;
    const myIndex = Array.from(myRef.parentNode.children).indexOf(myRef);
    const { width } = myRef.getBoundingClientRect();
    $childSizes[myIndex] = width;
  };

  onMount(() => {
    getW();
    addEventListener('resize', getW);
  });
</script>

<div
  bind:this={myRef}
  class={style.carouselItem}
  style="oveflow: hidden; {$slideWidth ? `width:${$slideWidth}px;` : ''}"
>
  <slot />
</div>
