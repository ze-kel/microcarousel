<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';

  import style from './style.module.css';
  import type { Writable } from 'svelte/store';
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

  onMount(() => {
    const getW = () => {
      if (!myRef || !myRef.parentNode) return;

      const myIndex = Array.from(myRef.parentNode.children).indexOf(myRef);

      const { width } = myRef.getBoundingClientRect();
      $childSizes[myIndex] = width;
    };

    getW();

    addEventListener('resize', getW);
  });
</script>

<div
  bind:this={myRef}
  class={style.carouselItem}
  style="max-width: {$carouselWidth}px; oveflow: hidden; {$slideWidth
    ? `width:${$slideWidth}px;`
    : ''}"
>
  {$carouselWidth}
  <slot />
</div>
