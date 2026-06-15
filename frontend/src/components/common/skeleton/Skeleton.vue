<template>
  <div>
    <component v-for="i in normalizedCount" :key="i" :is="componentMap[type]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ReviewItemSkeleton from './ReviewItemAdminSkeleton.vue'
import SkeletonStatCard from './SkeletonStatCard.vue'
import SkeletonChart from './SkeletonChart.vue'

const props = defineProps<{
  type: 'review' | 'stat' | 'chart'
  count?: number
}>()

const componentMap = {
  review: ReviewItemSkeleton,
  stat: SkeletonStatCard,
  chart: SkeletonChart
}

const normalizedCount = computed(() => {
  if (props.type === 'chart') return 1
  return props.count ?? 1
})
</script>