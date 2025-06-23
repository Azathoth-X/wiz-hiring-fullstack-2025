import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TimezoneState {
  timezone: string
  setTimezone: (timezone: string) => void
}

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set) => ({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      setTimezone: (timezone: string) => set({ timezone }),
    }),
    {
      name: 'bookmyslot-timezone',
    }
  )
)
