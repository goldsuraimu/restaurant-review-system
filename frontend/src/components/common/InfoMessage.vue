<template>
  <div :class="['info-message', typeClass]">
    <FontAwesomeIcon v-if="icon" :icon="icon" class="icon" />
    <span>
      <slot>{{ message }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  message?: string
  type?: 'info' | 'warning' | 'secondary' | 'danger'
  icon?: string[]
}>()

const typeClass = computed(() => {
  switch (props.type ?? 'info') {
    case 'info': return 'info-message--info'
    case 'warning': return 'info-message--warning'
    case 'danger': return 'info-message--danger'
    case 'secondary': return 'info-message--secondary'
    default: return 'info-message--info'
  }
})

</script>

<style scoped>
.info-message {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 置中 */
  padding: 1rem 1.5rem;
  /* 加大 padding */
  border-radius: 12px;
  /* 卡片感 */
  margin: 1rem 0;
  /* 與內容區隔 */
  font-size: 1rem;
  line-height: 1.5;
  gap: 0.8rem;
  color: #333;
  background-color: rgba(240, 240, 240, 0.9);
  /* 淡色半透明背景 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex-direction: row;
  max-width: 100%;
  word-break: break-word;
}

.info-message .icon {
  font-size: 1.2rem;
}

.message-text {
  font-weight: 600;
}

/* 類型樣式 */
.info-message--info {
  background-color: rgba(232, 244, 253, 0.9);
  color: #055160;
}

.info-message--warning {
  background-color: rgba(255, 244, 229, 0.9);
  color: #7a4a00;
}

.info-message--danger {
  background-color: rgba(253, 236, 234, 0.9);
  color: #a4161a;
}

.info-message--secondary {
  background-color: rgba(245, 245, 245, 0.9);
  color: #555;
}
</style>