<template>
  <div class="viewer-root" :class="{ fullscreen }" ref="containerRef">
    <!-- 關閉 -->
    <button v-if="fullscreen" class="close-btn" @click="$emit('close')">
      <FontAwesomeIcon :icon="['fas', 'xmark']" />
    </button>

    <!-- Zoom -->
    <button v-if="fullscreen" class="zoom-btn" @click="toggleZoom">
      <FontAwesomeIcon v-if="isZoomed" :icon="['fas', 'magnifying-glass-minus']" />

      <FontAwesomeIcon v-else :icon="['fas', 'magnifying-glass-plus']" />
    </button>

    <!-- 主圖 -->
    <div class="main-image" @click="handleImageClick" style="touch-action: none;">
      <img 
        v-if="currentImage" 
        :src="currentImage.url" 
        class="displayed-image" 
        :class="{ zoomed: isZoomed }"
        :style="transformStyle" 
        @pointerdown="startDrag($event)"
        @dragstart.prevent 
      />
    </div>

    <!-- 左右 -->
    <button v-if="currentIndex !== 0" class="nav-btn prev-btn" @click.stop="prevImage">
      <FontAwesomeIcon :icon="['fas', 'angle-left']" />
    </button>

    <button v-if="currentIndex !== images.length - 1" class="nav-btn next-btn" @click.stop="nextImage">
      <FontAwesomeIcon :icon="['fas', 'angle-right']" />
    </button>

    <!-- thumbnails -->
    <div class="thumbnail-container">
      <img v-for="img in images" :key="img.uuid" :src="img.url" class="thumbnail" :class="{
        active: currentImage?.uuid === img.uuid
      }" @click="setImage(images.findIndex(i => i.uuid === img.uuid))" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useImageLightbox } from '@/composables/ui/useImageLightbox'

import type { BaseImage } from '@/types'

const props = withDefaults(defineProps<{
  images: BaseImage[]
  fullscreen?: boolean
}>(), {
  fullscreen: false
})

const emit = defineEmits<{
  (e: 'request-fullscreen', index: number): void
  (e: 'close'): void
}>()

const {
  currentIndex,
  currentImage,
  isZoomed,
  containerRef,
  openLightbox,
  nextImage,
  prevImage,
  setImage,
  toggleZoom,
  startDrag,
  transformStyle,
} = useImageLightbox(
  computed(() => props.images)
)

function handleImageClick() {
  if (props.fullscreen) return

  emit('request-fullscreen', currentIndex.value)
}

defineExpose({
  openLightbox
})
</script>

<style scoped>
.viewer-root {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12px;
  background: white;
}

.viewer-root.fullscreen {
  width: 100vw;
  height: 100vh;
  aspect-ratio: auto;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.92);
}

.main-image {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  padding: 2rem;
}

.displayed-image {
  width: 100%;
  height: 100%;
  object-fit: contain;

  transition: transform 0.25s ease;
}

.displayed-image.zoomed {
  cursor: grab;
}

.zoom-btn,
.close-btn {
  position: absolute;
  top: 16px;

  z-index: 20;

  width: 44px;
  height: 44px;

  border: none;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.85);

  backdrop-filter: blur(6px);

  cursor: pointer;
}

.zoom-btn {
  right: 16px;
}

.close-btn {
  right: 72px;
}

.nav-btn {
  position: absolute;
  top: 50%;

  transform: translateY(-50%);

  z-index: 20;

  width: 48px;
  height: 48px;

  border: none;
  border-radius: 999px;

  background: rgba(0, 0, 0, 0.45);
  color: white;

  cursor: pointer;
}

.prev-btn {
  left: 16px;
}

.next-btn {
  right: 16px;
}

.thumbnail-container {
  position: absolute;

  bottom: 16px;
  left: 50%;

  transform: translateX(-50%);

  display: flex;
  gap: 8px;

  max-width: 90vw;
  overflow-x: auto;

  padding: 10px;

  background: rgba(255, 255, 255, 0.08);

  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.thumbnail {
  width: 64px;
  height: 64px;

  object-fit: cover;

  border-radius: 8px;

  cursor: pointer;

  opacity: 0.6;
  transition: 0.2s;
}

.thumbnail.active {
  opacity: 1;
  outline: 2px solid white;
}

@media (max-width: 768px) {
  .main-image {
    padding:
      4rem 1rem 8rem;
  }

  .thumbnail {
    width: 52px;
    height: 52px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }
}
</style>