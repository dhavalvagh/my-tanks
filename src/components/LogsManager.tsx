import { useMemo, useState } from "react"
import ReminderPanel from "./ReminderPanel"

type Tank = {
  id: string
  name: string
  volumeLiters: number
}

type WaterChange = {
  id: string
  tankId: string
  volumeLiters: number
  changedAt: number
}

type Feeding = {
  id: string
  tankId: string
  food: string
  fedAt: number
  notes?: string
}

type Reminder = {
  id: string
  title: string
  tankId?: string
  type: "water-change" | "feeding"
  everyHours: number
  nextDue: number
  enabled: boolean
}

type Props = {
  tanks: Tank[]
  waterChanges: WaterChange[]
  feedings: Feeding[]
  reminders: Reminder[]
  onLogWaterChange: (tankId: string, volumeLiters: number) => void
  onLogFeeding: (tankId: string, food: string) => void
  onCreateReminder: (reminder: Omit<Reminder, "id" | "nextDue" | "enabled">) => void
  onToggleReminder: (id: string, enabled: boolean) => void
  onDeleteReminder: (id: string) => void
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts))
}

export default function LogsManager({
  tanks,
  waterChanges,
  feedings,
  reminders,
  onLogWaterChange,
  onLogFeeding,
  onCreateReminder,
  onToggleReminder,
  onDeleteReminder
}: Props) {
  const [draftWater, setDraftWater] = useState({ tankId: "", percent: 25 })
  const [draftFeed, setDraftFeed] = useState({ tankId: "", food: "Pellets" })

  const lastWaterChange = useMemo(() => {
    const byTank: Record<string, string> = {}
    waterChanges.forEach(w => {
      byTank[w.tankId] = formatDate(w.changedAt)
    })
    return byTank
  }, [waterChanges])

  const lastFeeding = useMemo(() => {
    const byTank: Record<string, string> = {}
    feedings.forEach(f => {
      byTank[f.tankId] = formatDate(f.fedAt)
    })
    return byTank
  }, [feedings])

  function handleLogWaterChange() {
    if (!draftWater.tankId) return
    const tank = tanks.find(t => t.id === draftWater.tankId)
    const volume = tank ? Math.round((draftWater.percent / 100) * tank.volumeLiters) : 0
    onLogWaterChange(draftWater.tankId, volume)
  }

  function handleLogFeeding() {
    if (!draftFeed.tankId || !draftFeed.food) return
    onLogFeeding(draftFeed.tankId, draftFeed.food)
  }

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Maintenance logs</p>
          <h3>Water changes & feeding</h3>
          <p className="muted">Track maintenance schedule and set reminders</p>
        </div>
        <span className="pill info">Browser notifications</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-0)" }}>
          <p className="eyebrow" style={{ marginBottom: "var(--space-3)" }}>Log water change</p>
          <div className="form-grid">
            <label className="full">
              <span>Tank</span>
              <select value={draftWater.tankId} onChange={(e) => setDraftWater({ ...draftWater, tankId: e.target.value })}>
                <option value="">Select a tank</option>
                {tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="full">
              <span>Percent changed</span>
              <input type="number" value={draftWater.percent} onChange={(e) => setDraftWater({ ...draftWater, percent: Number(e.target.value) })} />
            </label>
          </div>
          <button className="primary" onClick={handleLogWaterChange} style={{ width: "100%", marginTop: "var(--space-3)" }}>
            💧 Log water change
          </button>
        </div>

        <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-0)" }}>
          <p className="eyebrow" style={{ marginBottom: "var(--space-3)" }}>Log feeding</p>
          <div className="form-grid">
            <label className="full">
              <span>Tank</span>
              <select value={draftFeed.tankId} onChange={(e) => setDraftFeed({ ...draftFeed, tankId: e.target.value })}>
                <option value="">Select a tank</option>
                {tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="full">
              <span>Food type</span>
              <input value={draftFeed.food} onChange={(e) => setDraftFeed({ ...draftFeed, food: e.target.value })} />
            </label>
          </div>
          <button className="secondary" onClick={handleLogFeeding} style={{ width: "100%", marginTop: "var(--space-3)" }}>
            🍽️ Log feeding
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
          <p className="eyebrow">Last maintenance per tank</p>
          <span className="pill subtle">{tanks.length} tanks</span>
        </div>
        <div className="mini-list">
          {tanks.length === 0 && <p className="muted">No tanks yet. Add a tank to start tracking.</p>}
          {tanks.map(t => (
            <div key={t.id} className="list-row">
              <div>
                <strong>{t.name}</strong>
                <p className="muted" style={{ fontSize: "var(--text-sm)" }}>
                  Water: {lastWaterChange[t.id] ?? "Not yet logged"} · Feeding: {lastFeeding[t.id] ?? "Not yet logged"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-0)" }}>
        <p className="eyebrow" style={{ marginBottom: "var(--space-3)" }}>⏰ Reminders</p>
        <ReminderPanel
          tanks={tanks}
          reminders={reminders}
          onCreate={onCreateReminder}
          onToggle={onToggleReminder}
          onDelete={onDeleteReminder}
        />
      </div>
    </section>
  )
}
