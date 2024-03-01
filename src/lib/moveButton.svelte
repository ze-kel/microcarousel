<script lang="ts">
  import { getContext } from 'svelte';
  import style from './style.module.css';
  import cls from 'classnames';

  const ctx = getContext('microcarouselData');

  if (!ctx) {
    console.error('ERROR: <MoveButton> Must be a child of <Carousel>');
  }

  const { moveSlide, currentSlide, totalSlides } = ctx;

  export let moveNumber: number;

  $: idDisabled =
    moveNumber > 0 ? $currentSlide + 1 >= $totalSlides : $currentSlide === 0;
</script>

<button
  class={cls(style.moveButton, $$props.class)}
  style={$$props.style}
  disabled={idDisabled}
  on:click={() => moveSlide(moveNumber)}
>
  <slot />
</button>
