<template>
  <div class="viewer-wrapper" :style="viewerStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: String,
    default: '100%', // 讓外部決定 layout
  },
  minWidth: {
    type: String,
    default: '320px',
  },
  maxWidth: {
    type: String,
    default: '900px', // 可選限制最大寬度
  },
  aspectRatio: {
    type: String,
    default: '4 / 3', // 預設比例
  },
  background: {
    type: String,
    default: 'white',
  },
});

const viewerStyle = computed(() => ({
  background: props.background,

  width: props.width,
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,

  // 高度交給比例
  aspectRatio: props.aspectRatio,
}));
</script>

<style scoped>
.viewer-wrapper {
  position: relative;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: clip;
}

@media (max-width: 768px) {
  .viewer-wrapper {
    width: 100%;
    aspect-ratio: 4 / 3;
  }
}
</style>