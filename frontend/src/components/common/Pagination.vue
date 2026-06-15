<template>
  <nav class="pagination">
    <button 
      v-if="pageInfo.hasPrevPage" 
      @click="handlePageClick(pageInfo.page - 1)"
    >
      <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
    </button>

    <button 
      v-for="item in pagesToDisplay" 
      :key="item.key" 
      :disabled="item.isEllipsis || item.page === pageInfo.page"
      @click="handlePageClick(item.page)" 
      :class="{ active: item.page === pageInfo.page }"
    >
      {{ item.label }}
    </button>

    <button 
      v-if="pageInfo.hasNextPage" 
      @click="handlePageClick(pageInfo.page + 1)"
    >
      <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { usePagination } from '@/composables/data/usePagination';
import type { ListMeta } from '@/types';

const props = withDefaults(defineProps<{
  pageInfo: ListMeta
  colorBg?: string       // 一般按鈕背景
  colorText?: string     // 一般按鈕文字
  colorActiveBg?: string // active 按鈕背景
  colorActiveText?: string // active 按鈕文字
}>(), {
  colorBg: '#9b4b4b',
  colorText: '#fff',
  colorActiveBg: '#842B00',
  colorActiveText: '#fff',
})

const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const pageInfoRef = toRef(props, 'pageInfo')

const { pagesToDisplay } = usePagination(pageInfoRef)

function handlePageClick(page: number | undefined) {
  if (!page || page === props.pageInfo.page) return
  emit('update:page', page)
}

</script>
<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 12px 0 15px 0;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid;
  background-color: v-bind(colorBg);
  color: v-bind(colorText);
  border-radius: 8px;
  opacity: 0.85;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination button:hover:not(:disabled) {
  opacity: 1;
  transform: translateY(-1px);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: default;
}

.pagination button.active {
  background-color: v-bind(colorActiveBg);
  color: v-bind(colorActiveText);
  opacity: 1;
  cursor: default;
}
</style>