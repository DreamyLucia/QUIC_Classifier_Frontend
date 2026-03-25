<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useAppStore } from '@/store/app'

const props = defineProps<{
  data: Record<string, number>
}>()

const appStore = useAppStore()
const chartRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

// 计算图表数据（只保留 value>0 的类别）
const chartData = computed(() => {
  return Object.keys(props.data)
    .filter(key => props.data[key] > 0)
    .map(key => ({
      name: key,
      value: props.data[key],
    }))
})

const textColor = computed(() => {
  return appStore.isDarkMode ? '#ffffff' : '#000000'
})

// 渲染图表
const renderChart = () => {
  if (!chartRef.value)
    return

  if (!myChart)
    myChart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value} (${params.percent.toFixed(1)}%)`
      },
    },
    legend: {
      orient: 'horizontal', // 水平排列
      left: 'center', // 水平居中
      top: 'bottom', // 放在底部
      bottom: 20, // 距离底部20px
      textStyle: {
        color: 'var(--normal-layout-text-color)',
      },
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: chartData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          show: true,
          color: textColor.value,
          formatter: '{b}: {d}%',
          fontSize: 12, // 字体大小
          fontWeight: 'normal', // 字体粗细 (normal/bold)
          fontFamily: 'inherit', // 字体族
          textBorderWidth: 0,
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
          backgroundColor: 'transparent',
        },
      },
    ],
  }

  myChart.setOption(option, true)
}

// 监听窗口大小变化
const handleResize = () => {
  myChart?.resize()
}

watch(() => appStore.isDarkMode, () => {
  renderChart()
})

// 监听数据变化
watch(() => props.data, () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div ref="chartRef" class="pie-chart" />
</template>

<style scoped>
@use '@/style/custom-theme' as *;
.pie-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
