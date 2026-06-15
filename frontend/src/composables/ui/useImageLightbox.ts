import { ref, computed, type Ref } from 'vue';
import type { BaseImage } from '@/types'

export function useImageLightbox(images: Ref<BaseImage[]>) {
  const currentIndex = ref(0);
  const isZoomed = ref(false);
  const zoomScale = ref(2.5)

  const containerRef = ref<HTMLElement | null>(null);

  const drag = ref({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    maxX: 0,
    maxY: 0,
  });

  // #region 控制
  function openLightbox(index: number) {
    currentIndex.value = index;
    resetZoom();
  }

  function closeLightbox() {
    resetZoom();
  }

  function nextImage() {
    if (currentIndex.value < images.value.length - 1) {
      currentIndex.value++;
      resetZoom();
    }
  }

  function prevImage() {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      resetZoom();
    }
  }

  function setImage(index: number) {
    if (index < 0 || index >= images.value.length) return;
    currentIndex.value = index;
    resetZoom();
  }
  // #endregion

  // #region 放大縮小與拖曳  
  function toggleZoom() {
    isZoomed.value = !isZoomed.value;
    if (isZoomed.value) computeMaxDrag();
    else resetDrag();
  }

  function resetZoom() {
    isZoomed.value = false;
    resetDrag();
  }

  function resetDrag() {
    drag.value.offsetX = 0;
    drag.value.offsetY = 0;
    drag.value.isDragging = false;
  }

  function computeMaxDrag() {
    if (!containerRef.value) return;
    const container = containerRef.value;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const overflowRatio = zoomScale.value - 1;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      drag.value.maxX = containerWidth * 0.6;
      drag.value.maxY = containerHeight * 0.6;
      return;
    }

    // desktop 才用 clamp
    drag.value.maxX = containerWidth * overflowRatio * 0.6;
    drag.value.maxY = containerHeight * overflowRatio * 0.6;
  }

  function startDrag(event: PointerEvent) {
    if (!isZoomed.value) return;

    drag.value.isDragging = true;
    drag.value.startX = event.clientX - drag.value.offsetX;
    drag.value.startY = event.clientY - drag.value.offsetY;

    window.addEventListener('pointermove', onDrag, { passive: false });
    window.addEventListener('pointerup', stopDrag);
  }

  function onDrag(event: PointerEvent) {
    if (!drag.value.isDragging) return;
    event.preventDefault(); // 阻止滾動

    const dx = event.clientX - drag.value.startX;
    const dy = event.clientY - drag.value.startY;

    const isMobile = window.innerWidth < 768;

    const resistance = isMobile ? 0.85 : 1;

    drag.value.offsetX = dx * resistance;
    drag.value.offsetY = dy * resistance;
  }

  function stopDrag() {
    drag.value.isDragging = false;
    window.removeEventListener('pointermove', onDrag);
    window.removeEventListener('pointerup', stopDrag);
  }

  function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
  }
  // #endregion

  // #region Computed 
  const currentImage = computed(() => images.value[currentIndex.value] ?? null);

  const transformStyle = computed(() => {
    return {
      transform: isZoomed.value
        ? `translate(${drag.value.offsetX}px, 
          ${drag.value.offsetY}px) scale(${zoomScale.value})`
          : 'scale(1)',
      cursor: isZoomed.value ? 'grab' : 'auto',
      // 拖動時取消 transition，避免卡頓
      transition: !drag.value.isDragging ? 'transform 0.3s ease' : 'none',
    };
  });

  // #endregion

  return {
    // state
    currentIndex,
    currentImage,
    isZoomed,

    // refs
    containerRef,

    // actions
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
    setImage,
    toggleZoom,
    startDrag,

    // computed
    transformStyle,
  };
}
