<script>
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    MoveButton,
  } from "./lib/index"

  export let base
  export let c = ""

  let actual = base
</script>

<CarouselItem maxWidth={actual}>
  <div class="slide" style="background: {c}; width: 100%;">
    <button
      on:click|stopPropagation={() => {
        console.log("btn")
        actual += 100
      }}>add width</button
    >
  </div>
</CarouselItem>

<style>
  .slide {
    width: 100%;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
