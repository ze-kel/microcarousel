<script lang="ts">
  import { getContext, onDestroy, onMount } from "svelte"

  import { type IContext } from "./helpers"

  const ctx = getContext("microcarouselData")

  if (!ctx) {
    console.error("ERROR: <CarouselItem> Must be a child of <Carousel>")
  }

  const { totalSlides, currentSlide } = ctx as IContext
</script>

<div class={$$props.class ? $$props.class : "wrapper"}>
  {#each Array($totalSlides) as _, i}
    <div
      class="item"
      data-pagination
      data-pagination-active={i === $currentSlide}
    />
  {/each}
</div>

<style>
  .wrapper {
    margin: 10px auto;
    width: fit-content;
    display: flex;
    gap: 4px;
  }

  .wrapper > [data-pagination] {
    width: 10px;
    height: 10px;
    background: gray;
    border-radius: 10px;
  }

  .wrapper > [data-pagination-active="true"] {
    background: white;
  }
</style>
