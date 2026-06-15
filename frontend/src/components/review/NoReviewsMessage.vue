<template>
  <div v-if="show" class="no-reviews text-center my-5">
    <FontAwesomeIcon :icon="['far', 'comment']" class="icon big" />
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  message?: string // 允許自定義提示訊息，默認為"目前還沒有評論，成為第一個留下評論的人吧！"
  show: boolean // 控制是否顯示該提示
}>()

const defaultMessage = '目前還沒有評論，成為第一個留下評論的人吧！'

const message = computed(() => props.message ?? defaultMessage)

</script>

<style scoped>
.no-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  transition: transform 0.2s ease;
}

.icon {
  font-size: 2.5rem;
  color: #999;
  margin-bottom: 8px;
}

.no-reviews p {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin: 0;
}

</style>