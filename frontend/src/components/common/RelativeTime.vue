<template>
  <small class="time" :title="tooltipText">

    <time :datetime="displayDatetime">
      {{ displayTime }}
    </time>

    <span v-if="showEdited && isEdited" class="edited">
      （已編輯）
    </span>
  </small>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useTimestamps } from '@/composables/utils/useTimestamps'

const props = withDefaults(defineProps<{
  createdAt: string
  updatedAt?: string
  color?: string
  editedColor?: string

  mode?: 'relative' | 'absolute'

  format?: 'date' | 'datetime'

  showEdited?: boolean
}>(), {
  color: '#6e6e6e',
  editedColor: '#9e9e9e',

  mode: 'relative',  // 預設使用相對時間顯示，若傳入 'absolute' 則顯示絕對時間

  format: 'datetime',

  showEdited: true,
})

const { relativeTime, displayedTime, originalCreatedAt, isEdited }
  = useTimestamps(
    props.createdAt,
    props.updatedAt
  )

// datetime 屬性（time 標籤）
const displayDatetime = computed(() => props.createdAt)

// 格式判斷
function formatAbsoluteTime(value: string) {
 
  if (!value) return ''

  return props.format === 'date'
    ? dayjs(value).format('YYYY-MM-DD')
    : value
}


// 畫面上顯示的時間
const displayTime = computed(() => {
  if (props.mode === 'relative') {
    return relativeTime.value
  }
 
  return formatAbsoluteTime(displayedTime.value)
})

// tooltip 文字
const tooltipText = computed(() => {
  return isEdited.value
    ? `創建時間：${originalCreatedAt.value}\n最後編輯時間:${displayedTime.value}`
    : `創建時間：${originalCreatedAt.value}`
})

</script>

<style scoped>
.time {
  font-size: 0.8rem;
  color: v-bind(color);
  opacity: 0.8;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

time {
  font-weight: 500;
}

.edited {
  color: v-bind(editedColor);
  font-size: 0.75rem;
  opacity: 0.75;
}
</style>