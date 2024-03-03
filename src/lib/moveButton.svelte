<script lang="ts">
  import { getContext } from 'svelte';
  import type { IContext } from './helpers';

  const ctx = getContext('microcarouselData');

  if (!ctx) {
    console.error('ERROR: <MoveButton> Must be a child of <Carousel>');
  }

  const { changeSlideValueAndUpdate, currentSlide, totalSlides, isLoop } =
    ctx as IContext;

  export let moveNumber: number;

  $: idDisabled = $isLoop
    ? false
    : moveNumber > 0
    ? $currentSlide + 1 >= $totalSlides
    : $currentSlide === 0;
</script>

<button
  class={$$props.class}
  style={$$props.style}
  disabled={idDisabled}
  on:click={() => changeSlideValueAndUpdate($currentSlide + moveNumber)}
>
  <slot />
</button>
