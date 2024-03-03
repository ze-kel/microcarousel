<script lang="ts">
  import { createEventDispatcher, onMount, setContext, tick } from "svelte"
  import { writable } from "svelte/store"
  import { tweened } from "svelte/motion"
  import { cubicOut } from "svelte/easing"
  import {
    _clamp,
    wrapAround,
    type IContext,
    type SlideInfo,
    contextName,
  } from "./helpers"

  const dispatch = createEventDispatcher()

  const TRANSITION_MS = 300

  export let showDebug = false
  export let itemsGap = 0
  export let slidesPerView = 1
  export let centerSlide = false
  export let fadeOnMount = true
  export let loop = false

  export let slide = 0

  let isMounted = !fadeOnMount

  // Refs
  let carouselRef: HTMLElement

  // Context values
  // Index of current slide
  const currentSlide = writable(0)
  // Total number of slides.
  const totalSlides = writable(0)
  // Wrap these in writeable because I pass them to context
  const isLoop = writable(loop)
  const gap = writable(itemsGap)
  // MaxWidth value from all carouselItem-s
  const slidesMaxWidth: (typeof context)["slidesMaxWidth"] = writable([])
  $: gap.set(itemsGap)
  // Width of our carousel(space on a page it occupies, not total size of all items)
  const carouselWidth = writable<number | null>(null)

  currentSlide.subscribe((v) => {
    dispatch("change", v)
  })

  onMount(() => {
    const getW = () => {
      if (!carouselRef) return
      const { width } = carouselRef.getBoundingClientRect()
      carouselWidth.set(width)
    }
    getW()
    window.addEventListener("resize", getW)
  })

  // Desired slide width according to slidesPerView. Actual width = min(slideWidth, maxWidth from carouselItem)
  const slideWidth = writable<number>()

  const updateSlideWidth = () => {
    if (!$carouselWidth) return
    const gaps = itemsGap * (Math.ceil(slidesPerView) - 1)
    slideWidth.set(($carouselWidth - gaps) / slidesPerView)
  }

  carouselWidth.subscribe(updateSlideWidth)

  // Calculates info about start\end(in offset values and width
  const slidesInfo = writable<SlideInfo[]>([])
  const calculateSlideInfo = () => {
    if (typeof $carouselWidth !== "number" || !slideWidth) return []

    let acc = 0
    const si = []

    const sw = $slidesMaxWidth
    for (let i = 0; i < $totalSlides; i++) {
      const slideW = Math.floor(Math.min(sw[i] || Infinity, $slideWidth))

      let offset = acc
      let start = offset - $carouselWidth
      let end = start + slideW + $carouselWidth

      // If slides are centered then we account for that
      if (centerSlide) {
        offset = offset - ($carouselWidth - slideW) / 2
      }

      si.push({ start: start, offset, width: slideW, end })
      acc += slideW + $gap
    }

    slidesInfo.set(si)
  }

  slideWidth.subscribe(calculateSlideInfo)
  slidesMaxWidth.subscribe(calculateSlideInfo)
  carouselWidth.subscribe(calculateSlideInfo)

  // Total size of content. All slides width and combined
  const totalSize = writable(0)
  slidesInfo.subscribe((v) => {
    if (v.length) {
      const lastItem = v[v.length - 1]
      const firstItem = v[0]

      totalSize.set(
        lastItem.offset +
          ($isLoop ? lastItem.width / 2 : lastItem.width) -
          ($isLoop
            ? firstItem.offset - firstItem.width / 2
            : firstItem.offset) +
          $gap
      )
    }
  })

  // Set slide to slide with index n
  const changeSlideValueAndUpdate = async (n: number) => {
    const clamped = _clamp(n, 0, $totalSlides - 1)

    if (!$isLoop || clamped === n) {
      currentSlide.set(clamped)
    } else {
      // Case where we want to set slide to -1 or +1 from the end
      const wrapped = wrapAround(n, 0, $totalSlides - 1)
      currentSlide.set(wrapped)
    }
    updateOffsetFromCurrentSlide(false)
  }

  $: changeSlideValueAndUpdate(slide)

  // Number of pixels we move out slides
  const currentOffset = tweened<number>(undefined, {
    easing: cubicOut,
    duration: TRANSITION_MS,
  })

  const activateUnsubscribe = currentOffset.subscribe(async (v) => {
    if (typeof v === "number" && !Number.isNaN(v)) {
      isMounted = true
      activateUnsubscribe()
    }
  })

  const updateOffsetFromCurrentSlide = (immediate?: boolean) => {
    if (!$slidesInfo.length) return

    // Again we wrap "fake" slides to real ones
    const wrapped = wrapAround($currentSlide, 0, $totalSlides - 1)

    const current = $currentOffset
    const target = $slidesInfo[wrapped].offset

    if (immediate) {
      currentOffset.set(target, { duration: 0 })
    }

    if (!isLoop) {
      currentOffset.set(target)
      return
    }

    // Direct, from looped ones
    const possibleMoves = [
      [current, target],
      [current + $totalSize, target],
      [current - $totalSize, target],
    ]

    const shortestMoveIndex = possibleMoves.reduce((a, b, index, arr) => {
      const aR = Math.abs(arr[a][0] - arr[a][1])
      const bR = Math.abs(arr[index][0] - arr[index][1])
      return aR < bR ? a : index
    }, 0)

    const shortestMove = possibleMoves[shortestMoveIndex]

    currentOffset.set(shortestMove[0], { duration: 0 })
    currentOffset.set(shortestMove[1])
  }

  slideWidth.subscribe(() => updateOffsetFromCurrentSlide())
  slidesInfo.subscribe(() => updateOffsetFromCurrentSlide())

  // Moving Handlers
  let isMoving = false
  let offsetBase: number | null = null
  let moveBase: number | null = null
  let moveStartTime: Date | null = null
  let moveHandlerCalls = 0

  const moveStart = (position: number) => {
    isMoving = true
    offsetBase = $currentOffset
    moveBase = position
    moveHandlerCalls = 0
    moveStartTime = new Date()
  }

  const moveHandler = (position: number) => {
    if (
      typeof offsetBase !== "number" ||
      typeof moveBase !== "number" ||
      typeof $carouselWidth !== "number"
    ) {
      console.error(
        "Move handler called without offsetbase or movebase or carouselWidth"
      )
      return
    }
    moveHandlerCalls++

    let offset = offsetBase + (moveBase - position)

    currentOffset.set(offset, { duration: 0 })
  }

  const finishMove = (e: Event) => {
    if (!isMoving) return

    if (
      typeof moveStartTime !== "object" ||
      typeof offsetBase !== "number" ||
      typeof $carouselWidth !== "number"
    ) {
      console.error(
        "finishMove called without offsetbase, moveStartTime or carouselWidth"
      )
      return
    }

    isMoving = false

    const finishTime = new Date()
    const moveTookS = (Number(finishTime) - Number(moveStartTime)) / 1000

    if (moveHandlerCalls < 1 || moveTookS < 0.05) {
      offsetBase = null
      moveBase = null
      moveStartTime = null
      updateOffsetFromCurrentSlide()
      return
    }

    const travel = offsetBase - $currentOffset
    const speed = travel / moveTookS

    const offset = $currentOffset

    const startPositions = $slidesInfo.map((v) => v.offset)

    // Finding Closest slide to where we ended up
    let minIndex = 0
    let minValue = Infinity

    for (let i = 0; i < startPositions.length; i++) {
      const v = startPositions[i]
      // Because of looping we consider also slides in +-1 loops
      const minV = Math.min(
        Math.abs(v - offset),
        ...($isLoop
          ? [
              Math.abs(v + $totalSize - offset),
              Math.abs(v - $totalSize - offset),
            ]
          : [])
      )

      if (minV < minValue) {
        minIndex = i
        minValue = minV
      }
    }

    // Inertia fakery. A short and fast swipe can move to next slide, kind of like on mobile.
    // Though it should not be too short to prevent accidental triggers
    const speedDirection = speed > 0 ? -1 : 1
    const speedModifier =
      minIndex === $currentSlide &&
      Math.abs(speed) > 500 &&
      Math.abs(travel) > Math.min($carouselWidth / 4, 75)
        ? 1
        : 0

    changeSlideValueAndUpdate(minIndex + speedDirection * speedModifier)

    offsetBase = null
    moveBase = null
    moveStartTime = null
  }

  const mouseDownHandler = (e: MouseEvent) => {
    moveStart(e.clientX)
  }

  const mouseMoveHandler = (e: MouseEvent) => {
    if (!isMoving) return
    moveHandler(e.clientX)
  }

  const touchStartHandler = (e: TouchEvent) => {
    const first = e.touches[0]
    moveStart(first.clientX)
  }

  const touchMoveHandler = (e: TouchEvent) => {
    if (!isMoving) return
    const first = e.touches[0]
    moveHandler(first.clientX)
  }

  const context: IContext = {
    slideWidth,
    currentSlide,
    currentOffset,
    gap,
    mouseDownHandler,
    mouseUpHandler: finishMove,
    mouseMoveHandler,
    touchEndHandler: finishMove,
    touchCancelHandler: finishMove,
    touchStartHandler,
    touchMoveHandler,
    changeSlideValueAndUpdate,
    totalSlides,
    slidesMaxWidth,
    slidesPerView,
    carouselWidth,
    isLoop,
    slidesInfo,
    totalSize,
  }

  // Context provide
  setContext(contextName, context)
</script>

<div
  bind:this={carouselRef}
  style="opacity: {isMounted ? 1 : 0};  
  width: 100%;
  overflow: hidden;
  transition: opacity 0.3s ease-out;
  position: relative;
  touch-action: pan-y;"
>
  <slot />
</div>
