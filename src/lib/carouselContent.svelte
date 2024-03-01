<script>
  import { getContext } from 'svelte';

  import style from './style.module.css';
  const ctx = getContext('microcarouselData');

  if (!ctx) {
    console.error('ERROR: <CarouselContent> Must be a child of <Carousel>');
  }

  const {
    currentOffset,
    totalSlides,
    currentSlide,
    gap,
    mouseDownHandler,
    mouseUpHandler,
    mouseMoveHandler,
    touchStartHandler,
    touchMoveHandler,
    touchEndHandler,
    touchCancelHandler,
  } = ctx;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class={style.carouselContent}
  on:mousedown={mouseDownHandler}
  on:mouseleave={mouseUpHandler}
  on:mouseup={mouseUpHandler}
  on:mousemove={mouseMoveHandler}
  on:touchstart={touchStartHandler}
  on:touchmove={touchMoveHandler}
  on:touchend={touchEndHandler}
  on:touchcancel={touchCancelHandler}
  style="
  display: flex;
   transform: translateX({$currentOffset * -1}px); gap: {$gap}px;"
>
  <slot />
</div>
