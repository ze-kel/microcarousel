<script lang="ts">
  import { getContext } from 'svelte';
  import style from './style.module.css';
  import cls from 'classnames';
  import type { Writable } from 'svelte/store';
  import type { IContext } from './helpers';

  const ctx = getContext('microcarouselData');

  if (!ctx) {
    console.error('ERROR: <MoveButton> Must be a child of <Carousel>');
  }

  const { moveSlide, currentSlide, totalSlides, isLoop } = ctx as IContext;

  export let moveNumber: number;

  $: idDisabled = $isLoop
    ? false
    : moveNumber > 0
    ? $currentSlide + 1 >= $totalSlides
    : $currentSlide === 0;
</script>

<button
  class={cls(style.moveButton, $$props.class)}
  style={$$props.style}
  disabled={idDisabled}
  on:click={() => moveSlide(moveNumber)}
>
  <slot />
</button>
