import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import type { ECharts, EChartsCoreOption } from 'echarts/core'

import {
  LineChart,
  BarChart
} from 'echarts/charts'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  CanvasRenderer
])

export function useEChart() {
  const chartRef = ref<HTMLDivElement | null>(null)

  let chart: ECharts | null = null
  let resizeHandler: (() => void) | null = null

  function initChart() {
    if (!chartRef.value) return

    if (!chart) {
      chart = echarts.init(chartRef.value)
    }
  }

  function setOption(option: EChartsCoreOption) {
    if (!chart) return

    chart.setOption(option, true)
  }

  onMounted(() => {
    initChart()

    resizeHandler = () => {
      chart?.resize()
    }

    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }

    // 釋放 chart
    chart?.dispose()
    chart = null
  })

  return {
    chartRef,
    setOption,
  }
}