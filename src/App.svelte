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
  <a class="link" href="https://github.com/ze-kel/microcarousel/tree/main">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      width="30px"
      height="30px"
      fill="white"
    >
      <path
        d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"
      />
    </svg>
    <span>GITHUB</span>
  </a>
  <h1>Microcarousel — Super minimal Svelte carousel.</h1>

  <p>
    Zero dependencies. Copy-Paste into any project that has Svelte and
    Typescript.
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
    <li>Any special effects(parallax, different transitions transitions)</li>
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
      on. Change event with correct value will be fired immediately too.
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

  .link {
    display: flex;
    gap: 8px;
    align-items: center;

    color: #fff;
    font-size: 18px;
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
