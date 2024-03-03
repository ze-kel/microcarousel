<script lang="ts">
  import { getContext } from "svelte"
  import type { IContext } from "./helpers"
  const ctx = getContext("microcarouselData")

  if (!ctx) {
    console.error("ERROR: <CarouselContent> Must be a child of <Carousel>")
  }

  const {
    currentOffset,
    gap,
    mouseDownHandler,
    mouseUpHandler,
    mouseMoveHandler,
    touchStartHandler,
    touchMoveHandler,
    touchEndHandler,
    touchCancelHandler,
  } = ctx as IContext
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class={$$props.class}
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
  width: fit-content;
   transform: translateX({$currentOffset * -1}px); gap: {$gap}px;"
>
  <slot />
</div>
