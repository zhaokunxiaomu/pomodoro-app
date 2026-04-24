<template>
  <div class="flex flex-col gap-8 w-full max-w-2xl">
    <h2 class="text-2xl font-bold text-center">📊 本周专注统计</h2>

    <!-- 汇总卡片 -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-gray-800 rounded-2xl p-5 text-center">
        <div class="text-4xl font-bold text-red-400">{{ store.todayCount }}</div>
        <div class="text-gray-400 text-sm mt-2">今日番茄</div>
      </div>
      <div class="bg-gray-800 rounded-2xl p-5 text-center">
        <div class="text-4xl font-bold text-orange-400">{{ weekTotal }}</div>
        <div class="text-gray-400 text-sm mt-2">本周番茄</div>
      </div>
      <div class="bg-gray-800 rounded-2xl p-5 text-center">
        <div class="text-4xl font-bold text-yellow-400">{{ store.totalCount }}</div>
        <div class="text-gray-400 text-sm mt-2">累计番茄</div>
      </div>
    </div>

    <!-- 柱状图 -->
    <div class="bg-gray-800 rounded-2xl p-6">
      <div ref="barChartEl" style="height:280px"></div>
    </div>

    <!-- 折线图 -->
    <div class="bg-gray-800 rounded-2xl p-6">
      <div ref="lineChartEl" style="height:220px"></div>
    </div>

    <!-- 记录列表 -->
    <div class="bg-gray-800 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <span class="font-semibold text-lg">📋 历史记录</span>
        <n-button size="small" type="error" @click="handleClear">清除全部</n-button>
      </div>
      <n-empty v-if="!store.records.length" description="暂无记录，快去专注吧！" />
      <div v-else class="flex flex-col gap-2 max-h-64 overflow-y-auto">
        <div
          v-for="r in [...store.records].reverse()"
          :key="r.id"
          class="flex justify-between items-center bg-gray-700 rounded-xl px-4 py-2 text-sm"
        >
          <span class="text-red-400">🍅 25 min</span>
          <span class="text-gray-300">{{ r.date }}</span>
          <span class="text-gray-400">{{ r.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { usePomodoroStore } from '../stores/pomodoro'
import { useDialog } from 'naive-ui'

const store = usePomodoroStore()
const dialog = useDialog()

const barChartEl = ref<HTMLElement | null>(null)
const lineChartEl = ref<HTMLElement | null>(null)
let barChart: ECharts | null = null
let lineChart: ECharts | null = null

const weekTotal = computed((): number => store.weekStats.reduce((s, d) => s + d.count, 0))

const dayLabels: string[] = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function renderCharts(): void {
  if (!barChart || !lineChart) return
  const counts: number[] = store.weekStats.map(d => d.count)

  barChart.setOption({
    title: { text: '本周每日专注次数', textStyle: { color: '#e5e7eb', fontSize: 14 }, left: 'center' },
    tooltip: { trigger: 'axis', formatter: '{b}: {c} 个番茄' },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dayLabels,
      axisLabel: { color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      type: 'bar',
      data: counts,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: (params: { dataIndex: number }) => {
          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
          return colors[params.dataIndex % colors.length]
        },
      },
      label: { show: true, position: 'top', color: '#e5e7eb', fontSize: 12 },
    }],
    backgroundColor: 'transparent',
  })

  const cumulative: number[] = counts.reduce((acc: number[], v, i) => {
    acc.push((acc[i - 1] ?? 0) + v)
    return acc
  }, [])

  lineChart.setOption({
    title: { text: '本周累计专注趋势', textStyle: { color: '#e5e7eb', fontSize: 14 }, left: 'center' },
    tooltip: { trigger: 'axis', formatter: '{b}: 累计 {c} 个' },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dayLabels,
      axisLabel: { color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      type: 'line',
      data: cumulative,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#ef4444', width: 3 },
      itemStyle: { color: '#ef4444' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(239,68,68,0.4)' },
            { offset: 1, color: 'rgba(239,68,68,0.02)' },
          ],
        },
      },
    }],
    backgroundColor: 'transparent',
  })
}

onMounted(() => {
  barChart = echarts.init(barChartEl.value!, 'dark')
  lineChart = echarts.init(lineChartEl.value!, 'dark')
  renderCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  lineChart?.dispose()
})

function handleResize(): void {
  barChart?.resize()
  lineChart?.resize()
}

watch(() => store.records.length, () => renderCharts())

function handleClear(): void {
  dialog.warning({
    title: '确认清除',
    content: '确定要清除所有专注记录吗？此操作不可恢复。',
    positiveText: '清除',
    negativeText: '取消',
    onPositiveClick: () => {
      store.clearRecords()
      renderCharts()
    },
  })
}
</script>
