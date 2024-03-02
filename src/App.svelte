<script lang="ts">
  import Counter from './counter.svelte';
  import Carousel from './lib/carousel.svelte';
  import CarouselContent from './lib/carouselContent.svelte';
  import CarouselItem from './lib/carouselItem.svelte';
  import MoveButton from './lib/moveButton.svelte';

  const colors = ['red', 'green', 'blue', 'purple', 'yellow'];
</script>

<main class="main">
  <h2>Basic</h2>
  <Carousel>
    <MoveButton moveNumber={-1} class="left">L</MoveButton>
    <MoveButton moveNumber={1} class="right">R</MoveButton>

    <CarouselContent>
      {#each colors as c}
        <CarouselItem>
          <div class="slide" style="background: {c};"><Counter /></div>
        </CarouselItem>
      {/each}
    </CarouselContent>
  </Carousel>

  <h2>slidesPerView 1.5 itemsGap 16</h2>
  <Carousel itemsGap={16} slidesPerView={1.5}>
    <MoveButton moveNumber={-1} class="left">L</MoveButton>
    <MoveButton moveNumber={1} class="right">R</MoveButton>

    <CarouselContent>
      {#each colors as c}
        <CarouselItem>
          <div class="slide" style="background: {c};"><Counter /></div>
        </CarouselItem>
      {/each}
    </CarouselContent>
  </Carousel>

  <h2>slidesPerView 1.5 itemsGap 16 centerSlide</h2>
  <Carousel itemsGap={16} slidesPerView={1.5} centerSlide>
    <MoveButton moveNumber={-1} class="left">L</MoveButton>
    <MoveButton moveNumber={1} class="right">R</MoveButton>

    <CarouselContent>
      {#each colors as c}
        <CarouselItem>
          <div class="slide" style="background: {c};"><Counter /></div>
        </CarouselItem>
      {/each}
    </CarouselContent>
  </Carousel>

  <div style="position: relative;">
    <h2>Different slide width</h2>
    <div>
      <div class="ruler" />
      <Carousel itemsGap={16} centerSlide>
        <MoveButton moveNumber={-1} class="left">L</MoveButton>
        <MoveButton moveNumber={1} class="right">R</MoveButton>

        <CarouselContent>
          {#each colors as c, i}
            <CarouselItem maxWidth={100 * (i + 2)}>
              <div class="slide" style="background: {c}; width: 100%;">
                <Counter />
              </div>
            </CarouselItem>
          {/each}
        </CarouselContent>
      </Carousel>
    </div>
  </div>
</main>

<style scoped>
  .main {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }

  :global(.left) {
    position: absolute;
    z-index: 4;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background: black;
    border-radius: 5px;
    padding: 20px;
    cursor: pointer;
    border: none;
    outline: none;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  :global(.right) {
    position: absolute;
    z-index: 4;
    right: 0;
    top: 50%;
    border: none;
    outline: none;

    transform: translateY(-50%);
    background: black;
    border-radius: 5px;
    padding: 20px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  .slide {
    width: 100%;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ruler {
    position: absolute;
    width: 50%;
    height: 100%;
    border-right: 1px solid black;
    z-index: 4;
    pointer-events: none;
  }
</style>
