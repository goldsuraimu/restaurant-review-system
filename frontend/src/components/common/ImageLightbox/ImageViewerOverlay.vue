<template>
  <div 
    :class="{ visible: props.visible }" 
    class="lightbox-overlay" 
    @pointerdown.self="closeOverlay"
  >
    <slot></slot> <!-- 這邊讓外層傳入其他元素 -->
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ 
  visible: boolean 
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

function closeOverlay() {
  emit('update:visible', false);
}

</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.85);

  z-index: 9999;
  /* 保持在最上層 */
  opacity: 0;
  /* 隱藏時透明 */
  pointer-events: none;
  /* 隱藏時不攔截事件 */
  transition: opacity 0.2s ease;
}

.lightbox-overlay.visible {
  opacity: 1;
  pointer-events: auto;
  /* 顯示時可以操作 */
}

</style>
