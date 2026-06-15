<template>
  <Teleport to="body">
    <ImageViewerOverlay 
      :visible="props.visible" 
      @update:visible="emit('update:visible', $event)"
    >
      <div class="fullscreen-wrapper">
        <ImageViewer 
          ref="viewerRef" 
          :images="images" 
          :fullscreen="true"
          @close="close"
        />
      </div>
    </ImageViewerOverlay>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import ImageViewer from './ImageViewer.vue'
import ImageViewerOverlay from './ImageViewerOverlay.vue'

import type { BaseImage } from '@/types'

const props = defineProps<{
  visible: boolean
  images: BaseImage[]
  initialIndex?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const viewerRef = ref<InstanceType<typeof ImageViewer> | null>(null)

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return

    requestAnimationFrame(() => {
      viewerRef.value?.openLightbox(props.initialIndex ?? 0)
    })
  }
)

function close() {
  emit('update:visible', false)
}
</script>

<style scoped>
.fullscreen-wrapper {
  width: 100vw;
  height: 100vh;
}
</style>