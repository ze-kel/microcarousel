<script lang="ts">
  import { getContext, onDestroy, onMount } from "svelte"

  import { contextName, type IContext } from "./helpers"

  export let maxWidth = Infinity

  const ctx = getContext(contextName)

  if (!ctx) {
    console.error("ERROR: <CarouselItem> Must be a child of <Carousel>")
  }

  const {
    slideWidth,
    totalSlides,
    currentOffset,
    slidesInfo,
    slidesMaxWidth,
    totalSize,
    isLoop,
    currentSlide,
  } = ctx as IContext

  totalSlides.set($totalSlides + 1)

  let myRef: HTMLElement

  let myIndex: number

  const getW = () => {
    if (!myRef || !myRef.parentNode) return
    const myIndex = Array.from(myRef.parentNode.children).indexOf(myRef)
    $slidesMaxWidth[myIndex] = maxWidth ? maxWidth : null
  }

  const widthUpdater = (w: number) => {
    slidesMaxWidth.update((v) => {
      const n = [...v]
      n[myIndex] = w ? w : null
      return n
    })
  }

  $: widthUpdater(maxWidth)

  onMount(() => {
    getW()
    addEventListener("resize", getW)

    if (!myRef || !myRef.parentNode) return
    myIndex = Array.from(myRef.parentNode.children).indexOf(myRef)
  })

  onDestroy(() => {
    removeEventListener("resize", getW)
    const old = $slidesMaxWidth

    old.splice(myIndex, 0)
    $slidesMaxWidth = old
    totalSlides.set($totalSlides - 1)
  })

  $: widthStyle = $slideWidth
    ? `width:${Math.min($slideWidth, maxWidth)}px;`
    : "width: 100%;"

  let visibleReal = true
  let visibleMinusLoop = false
  let visiblePlusLoop = false

  const computeVisibility = () => {
    if (!$slidesInfo[myIndex]) return
    const { start, end } = $slidesInfo[myIndex]

    const off = $currentOffset

    visibleReal = off >= start && off <= end
    visibleMinusLoop = off >= start - $totalSize && off <= end - $totalSize
    visiblePlusLoop = off >= start + $totalSize && off <= end + $totalSize
  }

  slidesInfo.subscribe(computeVisibility)
  currentOffset.subscribe(computeVisibility)
  totalSize.subscribe(computeVisibility)

  $: moveNumber = visibleReal
    ? 0
    : visiblePlusLoop
    ? $totalSize
    : visibleMinusLoop
    ? -$totalSize
    : 0

  $: moveStyle = `transform: translateX(${moveNumber}px);`
</script>

<div
  class={$$props.class}
  bind:this={myRef}
  style="flex-shrink: 0; overflow: hidden; {widthStyle} {!$isLoop
    ? ''
    : moveStyle}"
  data-slide
  data-slide-index={myIndex}
  data-current-slide={myIndex === $currentSlide}
>
  <slot />
</div>
