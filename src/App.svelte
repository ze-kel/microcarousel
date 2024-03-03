<script lang="ts">
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    MoveButton,
  } from './lib/index';
  import Counter from './counter.svelte';

  const colors = ['red', 'green', 'blue', 'purple', 'yellow', 'orange', 'cyan'];
</script>

<main class="main">
  <h1>Microcarousel — Super minimal svelte carousel.</h1>

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
    <li>Any number of slides per view(including decimal, i.e 2.5)</li>
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
    <li>Changing slide widths, adding slides without full remount</li>
  </ul>

  <h2>Examples:</h2>
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
  </Carousel>

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
  </Carousel>

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
  </Carousel>

  <code style="white-space: pre;">
    {`<Carousel itemsGap={32} slidesPerView={1.5} centerSlide loop>`}
  </code>
  <p>
    Note that looping requires at least two full screens of slides. So at least
    2 slides for slidesPerView=1, at least 8 for slidesPerView=4 etc.
  </p>
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
  </Carousel>

  <h2>Different slide width</h2>
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
