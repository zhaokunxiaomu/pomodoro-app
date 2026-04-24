<template>
  <div class="flex flex-col items-center gap-10 w-full max-w-md">
    <!-- 模式选择 -->
    <div class="flex gap-3">
      <n-button
        v-for="m in modes"
        :key="m.key"
        :type="currentMode === m.key ? 'primary' : 'default'"
        size="small"
        @click="switchMode(m.key)"
      >
        {{ m.label }}
      </n-button>
    </div>

    <!-- 圆形进度 + 倒计时 -->
    <div class="relative flex items-center justify-center" style="width:260px;height:260px">
      <svg class="absolute" width="260" height="260">
        <circle cx="130" cy="130" r="120" fill="none" stroke="#1f2937" stroke-width="12" />
        <circle
          cx="130" cy="130" r="120"
          fill="none"
          :stroke="progressColor"
          stroke-width="12"
          stroke-linecap="round"
          stroke-dasharray="753.98"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 130 130)"
          style="transition: stroke-dashoffset 1s linear"
        />
      </svg>
      <div class="flex flex-col items-center z-10">
        <span class="text-6xl font-mono font-bold tracking-tight">{{ displayTime }}</span>
        <span class="text-gray-400 mt-2 text-sm">{{ modeLabel }}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="flex gap-4">
      <n-button
        :type="running ? 'error' : 'primary'"
        size="large"
        style="width:120px"
        @click="toggleTimer"
      >
        {{ running ? '⏸ 暂停' : (timeLeft < totalSeconds ? '▶ 继续' : '▶ 开始') }}
      </n-button>
      <n-button size="large" @click="resetTimer">↺ 重置</n-button>
    </div>

    <!-- 今日统计卡片 -->
    <div class="grid grid-cols-2 gap-4 w-full">
      <div class="bg-gray-800 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-red-400">{{ store.todayCount }}</div>
        <div class="text-gray-400 text-sm mt-1">今日专注</div>
      </div>
      <div class="bg-gray-800 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-orange-400">{{ store.totalCount }}</div>
        <div class="text-gray-400 text-sm mt-1">累计专注</div>
      </div>
    </div>

    <!-- 完成通知 -->
    <n-modal v-model:show="showModal">
      <n-card
        style="width:320px;border-radius:16px"
        title="🎉 专注完成！"
        :bordered="false"
      >
        <p class="text-gray-300">坚持就是胜利！休息一下再继续吧 🍵</p>
        <p class="text-gray-400 text-sm mt-2">今日已完成 <b class="text-red-400">{{ store.todayCount }}</b> 个番茄</p>
        <template #footer>
          <div class="flex gap-2 justify-end">
            <n-button @click="startBreak">☕ 短休息</n-button>
            <n-button type="primary" @click="startNext">🍅 继续专注</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro'
import { useMessage } from 'naive-ui'

type ModeKey = 'focus' | 'short' | 'long'

interface Mode {
  key: ModeKey
  label: string
  minutes: number
}

const store = usePomodoroStore()
const message = useMessage()

const modes: Mode[] = [
  { key: 'focus', label: '🍅 专注 25min', minutes: 25 },
  { key: 'short', label: '☕ 短休息 5min', minutes: 5 },
  { key: 'long', label: '🛋 长休息 15min', minutes: 15 },
]

const currentMode = ref<ModeKey>('focus')
const totalSeconds = computed(() => modes.find(m => m.key === currentMode.value)!.minutes * 60)
const timeLeft = ref<number>(totalSeconds.value)
const running = ref<boolean>(false)
const showModal = ref<boolean>(false)

let timer: ReturnType<typeof setInterval> | null = null

const modeLabel = computed(() => modes.find(m => m.key === currentMode.value)!.label)

const progressColor = computed((): string => {
  if (currentMode.value === 'focus') return '#ef4444'
  if (currentMode.value === 'short') return '#f97316'
  return '#3b82f6'
})

const dashOffset = computed((): number => {
  const total = 2 * Math.PI * 120
  return total * (timeLeft.value / totalSeconds.value)
})

const displayTime = computed((): string => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function tick(): void {
  if (timeLeft.value > 0) {
    timeLeft.value--
  } else {
    if (timer) clearInterval(timer)
    running.value = false
    if (currentMode.value === 'focus') {
      store.addRecord()
      showModal.value = true
    } else {
      message.success('休息结束，准备下一个番茄！')
      switchMode('focus')
    }
  }
}

function toggleTimer(): void {
  if (running.value) {
    if (timer) clearInterval(timer)
    running.value = false
  } else {
    running.value = true
    timer = setInterval(tick, 1000)
  }
}

function resetTimer(): void {
  if (timer) clearInterval(timer)
  running.value = false
  timeLeft.value = totalSeconds.value
}

function switchMode(key: ModeKey): void {
  if (timer) clearInterval(timer)
  running.value = false
  currentMode.value = key
  timeLeft.value = modes.find(m => m.key === key)!.minutes * 60
}

function startBreak(): void {
  showModal.value = false
  switchMode('short')
}

function startNext(): void {
  showModal.value = false
  switchMode('focus')
}

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>
