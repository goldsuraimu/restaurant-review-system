<template>

  <SkeletonChart v-if="isFetching" />

  <div v-show="!isFetching" ref="chartRef" style="width: 100%; height: 300px;"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'

import { truncateText } from '@/utils/text'

import { useEChart } from '@/composables/chart/useEChart'

import SkeletonChart from '@/components/common/skeleton/SkeletonChart.vue'


interface Restaurant {
  restaurantName: string
  avgRating: number
}

const props = withDefaults(defineProps<{
  data: Restaurant[]
  isFetching?: boolean
}>(), {
  isFetching: false
})

const { chartRef, setOption } = useEChart()

function renderStars(rating: number) {
  const safe = Math.max(0, Math.min(5, rating))

  const full = Math.floor(safe)
  const half = safe % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    '★'.repeat(full) +
    (half ? '⯨' : '') +
    '☆'.repeat(empty)
  )
}

function renderChart() {
  setOption({
    title: {
      text: '各餐廳評分'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const index = params[0].dataIndex
        const r = props.data[index]

        const starColor = r.avgRating >= 4.5 ? '#28a745': r.avgRating >= 3.5 ? '#ffc107' : '#dc3545'
        const ratingColor = '#333' // 數字保持常規顏色

        return `
      ${r.restaurantName}<br/>
      <span style="color:${starColor}; font-weight:600">
        ${renderStars(r.avgRating)} 
      </span>
      <span style="color:${ratingColor}; font-weight:400">
        ${r.avgRating}
      </span>
    `
      }
    },
    xAxis: {
      type: 'category',
      data: props.data.map(r => truncateText(r.restaurantName, 8)),
      axisLabel: {
        interval: 0,
        rotate: 15
      }
    },
    yAxis: {
      type: 'value',
      max: 5
    },
    series: [
      {
        type: 'bar',
        data: props.data.map(r => r.avgRating),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  })
}


onMounted(async () => {
  await nextTick()
  renderChart()
})

watch(
  () => props.data,
  renderChart
)
</script>