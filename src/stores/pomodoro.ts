import { defineStore } from 'pinia'

interface PomodoroRecord {
  id: number
  date: string
  time: string
  duration: number
}

interface WeekStatItem {
  date: string
  count: number
}

const STORAGE_KEY = 'pomodoro_records'

function getThisWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export const usePomodoroStore = defineStore('pomodoro', {
  state: () => ({
    records: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as PomodoroRecord[],
  }),
  getters: {
    weekDates: (): string[] => getThisWeekDates(),
    weekStats(state): WeekStatItem[] {
      const dates = getThisWeekDates()
      return dates.map(date => ({
        date,
        count: state.records.filter(r => r.date === date).length,
      }))
    },
    todayCount(state): number {
      const today = new Date().toISOString().slice(0, 10)
      return state.records.filter(r => r.date === today).length
    },
    totalCount(state): number {
      return state.records.length
    },
  },
  actions: {
    addRecord(): void {
      const record: PomodoroRecord = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString(),
        duration: 25,
      }
      this.records.push(record)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records))
    },
    clearRecords(): void {
      this.records = []
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
