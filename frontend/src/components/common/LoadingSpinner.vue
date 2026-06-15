<template>
  <div class="loading-container">
    <div class="custom-spinner" :style="{
      width: size + 'px',
      height: size + 'px',
      border: borderWidth + 'px solid #ccc',
      borderTop: borderWidth + 'px solid ' + color
    }"></div>
    <div class="loading-text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: { type: Number, default: 50 },
  borderWidth: { type: Number, default: 4 },
  color: { type: String, default: '#42b983' },
  text: { type: String, default: '載入中…' }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.custom-spinner {
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 8px;
  font-size: 14px;
  color: #555;
}
</style>
