export const wrapAround = (num: number, min: number, max: number) => {
  const range = max - min + 1;
  return ((((num - min) % range) + range) % range) + min;
};

export const _clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

export type IContext = {
  slideWidth: Writable<number>;
  currentSlide: Writable<number>;
  currentOffset: Tweened<number>;
  gap: Writable<number>;
  mouseDownHandler: (e: MouseEvent) => void;
  mouseUpHandler: (e: Event) => void;
  mouseMoveHandler: (e: MouseEvent) => void;
  touchEndHandler: (e: Event) => void;
  touchCancelHandler: (e: Event) => void;
  touchStartHandler: (e: TouchEvent) => void;
  touchMoveHandler: (e: TouchEvent) => void;
  totalSlides: Writable<number>;
  slidesMaxWidth: Writable<number[]>;
  slidesPerView: number;
  carouselWidth: Writable<number | null>;
  isLoop: Writable<boolean>;
  slidesInfo: Writable<SlideInfo[]>;
  totalSize: Writable<number>;
  changeSlideValueAndUpdate: (n: number) => Promise<void>;
};
