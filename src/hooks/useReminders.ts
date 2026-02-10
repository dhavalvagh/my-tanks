import { useEffect } from "react"
import { notify } from "../services/notifications"

type Reminder = {
  id: string
  title: string
  tankId?: string
  type: "water-change" | "feeding"
  everyHours: number
  nextDue: number
  enabled: boolean
}

export function useReminders(
  reminders: Reminder[],
  hydrated: boolean,
  tankNameLookup: (id: string) => string,
  onUpdate: (reminders: Reminder[]) => void
) {
  useEffect(() => {
    if (!hydrated) return
    const timer = setInterval(() => {
      const now = Date.now()
      let dirty = false
      const updated = reminders.map(r => {
        if (!r.enabled || now < r.nextDue) return r
        notify(r.title || "Aquarium reminder", `Time for a ${r.type === "feeding" ? "feeding" : "water change"}${r.tankId ? ` (${tankNameLookup(r.tankId)})` : ""}.`)
        dirty = true
        return { ...r, nextDue: now + r.everyHours * 60 * 60 * 1000 }
      })
      if (dirty) onUpdate(updated)
    }, 60000)
    return () => clearInterval(timer)
  }, [hydrated, reminders, tankNameLookup, onUpdate])
}
