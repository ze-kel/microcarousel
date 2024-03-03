<script lang="ts">
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    MoveButton,
  } from "./lib/index"
  import Counter from "./counter.svelte"
  import Dynamic from "./dynamicSlide.svelte"
  import CarouselPagination from "./lib/carouselPagination.svelte"

  const colors = [
    "#ffbe0b",
    "#fb5607",
    "#ff006e",
    "#8338ec",
    "#3a86ff",
    "#caf0f8",
    "#84a98c",
  ]

  let controlled = 0
</script>

<main class="main">
  <h1>Microcarousel — Super minimal Svelte carousel.</h1>

  <p>
    Zero dependencies. Copy-Paste into any project that has Svelte and
    Typesript.
  </p>

  <p>
    This is more like a personal research project, I have 0 tests so there
    probably are bugs. Use at your own risk.
  </p>

  <h3>Implemented features:</h3>

  <ul>
    <li>Basic carousel</li>
    <li>Swipe left\right by n slides buttons</li>
    <li>Pagination</li>
    <li>Any number of slides per view(including decimal, i.e 2.5)</li>
    <li>Variable slide width</li>
    <li>Looping</li>
  </ul>

  <h3>Not implemented features:</h3>
  <ul>
    <li>RtL slider, vertical sliders.</li>
    <li>Any special effects(parralax, different transitions transitions)</li>
    <li>Auto scroll</li>
  </ul>

  <h3>Untested and likely to break</h3>
  <ul>
    <li>Slider in slider</li>
    <li>Adding or removing slides without full remount</li>
  </ul>

  <h2>Examples:</h2>
  <div class="examples">
    <h2>Basic</h2>
    <code style="white-space: pre;">
      {`import { Carousel, CarouselContent, CarouselItem, MoveButton } from './lib/index';
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
</Carousel>`}
    </code>
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
      <CarouselPagination />
    </Carousel>

    <h2>Multiple slides per view</h2>
    <code style="white-space: pre;">
      {`<Carousel itemsGap={16} slidesPerView={3}>`}
    </code>
    <Carousel itemsGap={16} slidesPerView={3}>
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>

      <CarouselContent>
        {#each colors as c}
          <CarouselItem>
            <div class="slide" style="background: {c};"><Counter /></div>
          </CarouselItem>
        {/each}
      </CarouselContent>
      <CarouselPagination />
    </Carousel>

    <h2>Centering</h2>
    <code style="white-space: pre;">
      {`<Carousel itemsGap={32} slidesPerView={1.5} centerSlide>`}
    </code>
    <Carousel itemsGap={32} slidesPerView={1.5} centerSlide>
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>

      <CarouselContent>
        {#each colors as c}
          <CarouselItem>
            <div class="slide" style="background: {c};"><Counter /></div>
          </CarouselItem>
        {/each}
      </CarouselContent>
      <CarouselPagination />
    </Carousel>

    <h2>Looping</h2>
    <p>
      Looping requires at least two full screens of slides. So at least 2 slides
      for slidesPerView=1, at least 8 for slidesPerView=4 etc.
    </p>
    <code style="white-space: pre;">
      {`<Carousel itemsGap={32} slidesPerView={4} centerSlide loop>`}
    </code>

    <Carousel itemsGap={32} slidesPerView={4} centerSlide loop>
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>

      <CarouselContent>
        {#each colors as c}
          <CarouselItem>
            <div class="slide" style="background: {c};"><Counter /></div>
          </CarouselItem>
        {/each}
      </CarouselContent>
      <CarouselPagination />
    </Carousel>

    <h2>Slides with different widths</h2>
    <p>
      Max-width is set on component. This is easier to handle constant
      getBoundingClientRect calls.<br /> Breakpoints handling is up to you, all width
      changes will trigger recalculation
    </p>
    <p>
      Note that this is max width, real width will be Math.max(carouselWidth,
      maxWidth)
    </p>
    <code style="white-space: pre;">
      {`<CarouselItem maxWidth={100 * (index + 2)>`}
    </code>
    <Carousel itemsGap={16} centerSlide loop>
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>
      <CarouselContent>
        {#each colors as c, i}
          <Dynamic {c} base={100 * (i + 2)} />
        {/each}
      </CarouselContent>
      <CarouselPagination />
    </Carousel>

    <h2>Styling pagination</h2>
    <p>Adding class to pagination element will disable default styling.</p>

    <code style="white-space: pre; margin-bottom: 5px">
      {`<CarouselPagination class="custom" />`}
    </code>
    <code style="white-space: pre;">
      {`.custom {
  margin: 10px auto;
  width: fit-content;
  display: flex;
  gap: 4px;
}

.custom > [data-pagination] {
  width: 20px;
  height: 20px;
  background: gray;
  border-radius: 6px;
}

.custom > [data-pagination-active="true"] {
  background: orange;
}`}
    </code>
    <Carousel itemsGap={16} centerSlide loop>
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>
      <CarouselContent>
        {#each colors as c}
          <CarouselItem>
            <div class="slideSmall" style="background: {c};"><Counter /></div>
          </CarouselItem>
        {/each}
      </CarouselContent>
      <CarouselPagination class="custom" />
    </Carousel>

    <h2>Styling active slide</h2>
    <code style="white-space: pre; margin-bottom: 5px">
      {`<CarouselItem class="itemFade">`}
    </code>
    <code style="white-space: pre;">
      {`.itemFade {
  opacity: 0.2;
  transition: 0.3s opacity;
}

.itemFade[data-current-slide="true"] {
  opacity: 1;
}`}
    </code>
    <Carousel itemsGap={16} slidesPerView={4} centerSlide loop>
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>
      <CarouselContent>
        {#each colors as c}
          <CarouselItem class="itemFade">
            <div class="slideSmall" style="background: {c};"><Counter /></div>
          </CarouselItem>
        {/each}
      </CarouselContent>
    </Carousel>

    <h2>Controlled externally</h2>
    <p>
      You can pass negative or overflowing values: -1 becomes last slide, and so
      on. Change event with correct value will be fired immediatelly too.
    </p>
    <code style="white-space: pre; margin-bottom: 5px">
      {`<input type="number" bind:value={controlled} />
<Carousel itemsGap={16} slidesPerView={4} centerSlide loop slide={controlled} on:change={(e) => (controlled = e.detail)}>`}
    </code>
    <input type="number" bind:value={controlled} />
    <Carousel
      itemsGap={16}
      slidesPerView={4}
      centerSlide
      loop
      slide={controlled}
      on:change={(e) => (controlled = e.detail)}
    >
      <MoveButton moveNumber={-1} class="left">L</MoveButton>
      <MoveButton moveNumber={1} class="right">R</MoveButton>
      <CarouselContent>
        {#each colors as c}
          <CarouselItem>
            <div class="slideSmall" style="background: {c};"><Counter /></div>
          </CarouselItem>
        {/each}
      </CarouselContent>
    </Carousel>
  </div>
</main>

<style>
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

  .slideSmall {
    width: 100%;
    height: 200px;
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

  :global(.custom) {
    margin: 10px auto;
    width: fit-content;
    display: flex;
    gap: 4px;
  }

  :global(.custom > [data-pagination]) {
    width: 20px;
    height: 20px;
    background: gray;
    border-radius: 6px;
  }

  :global(.custom > [data-pagination-active="true"]) {
    background: orange;
  }

  :global(.itemFade) {
    opacity: 0.2;
    transition: 0.3s opacity;
  }

  :global(.itemFade[data-current-slide="true"]) {
    opacity: 1;
  }
</style>
