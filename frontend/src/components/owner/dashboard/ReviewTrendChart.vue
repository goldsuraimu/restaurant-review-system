<template>

  <SkeletonChart v-if="isFetching" />

  <div v-show="!isFetching" ref="chartRef" style="width: 100%; height: 300px;"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'

import { useEChart } from '@/composables/chart/useEChart'

import SkeletonChart from '@/components/common/skeleton/SkeletonChart.vue'


interface TrendItem {
  date: string
  count: number
}

const props = withDefaults(defineProps<{
  data: TrendItem[]
  isFetching?: boolean
}>(), {
  isFetching: false
})

const { chartRef, setOption } = useEChart()


function renderChart() {
  setOption({
    title: {
      text: '近 7 天評論趨勢'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: props.data.map(d => d.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '評論數',
        type: 'line',
        smooth: true,
        areaStyle: {},
        data: props.data.map(d => d.count)
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