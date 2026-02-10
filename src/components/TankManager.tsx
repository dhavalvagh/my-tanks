import { useState } from "react"
import { litersFromDimensions, recommendedFlow } from "../services/stocking"

type TankLabel = string

export type Tank = {
  id: string
  name: string
  label: TankLabel
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  headspaceCm?: number
  substrateDepthCm?: number
  glassThicknessCm?: number
  volumeLiters: number
  flowRateLph?: number
  notes?: string
}

type Props = {
  tanks: Tank[]
  onSave: (tank: Tank) => void
  onDelete: (tankId: string) => void
  onOpenDetail: (tankId: string) => void
}

export default function TankManager({ tanks, onSave, onDelete, onOpenDetail }: Props) {
  const [draftTank, setDraftTank] = useState<Partial<Tank>>({ label: "other", volumeLiters: 60 })
  const [editingTankId, setEditingTankId] = useState<string | null>(null)
  const [showAdvancedTank, setShowAdvancedTank] = useState(false)
  const [showLabelChips, setShowLabelChips] = useState(false)

  const labelSuggestions = ["Small", "Big", "Quarantine", "Display", "Shrimp", "Grow-out"]

  function saveTank() {
    if (!draftTank.name) return
    const volume = litersFromDimensions(
      draftTank.lengthCm,
      draftTank.widthCm,
      draftTank.heightCm,
      { headspaceCm: draftTank.headspaceCm, substrateDepthCm: draftTank.substrateDepthCm, glassThicknessCm: draftTank.glassThicknessCm }
    )
    if (!volume) return

    const flow = recommendedFlow(volume).fishOnly.min

    const tankData: Tank = {
      id: editingTankId || crypto.randomUUID(),
      name: draftTank.name,
      label: (draftTank.label as TankLabel) ?? "other",
      lengthCm: draftTank.lengthCm,
      widthCm: draftTank.widthCm,
      heightCm: draftTank.heightCm,
      headspaceCm: draftTank.headspaceCm,
      substrateDepthCm: draftTank.substrateDepthCm,
      glassThicknessCm: draftTank.glassThicknessCm,
      volumeLiters: volume,
      flowRateLph: flow,
      notes: draftTank.notes
    }

    onSave(tankData)
    setDraftTank({ label: "other", volumeLiters: 60 })
    setEditingTankId(null)
    setShowAdvancedTank(false)
  }

  function startEdit(tank: Tank) {
    setDraftTank({
      name: tank.name,
      label: tank.label,
      lengthCm: tank.lengthCm,
      widthCm: tank.widthCm,
      heightCm: tank.heightCm,
      headspaceCm: tank.headspaceCm,
      substrateDepthCm: tank.substrateDepthCm,
      glassThicknessCm: tank.glassThicknessCm,
      notes: tank.notes
    })
    setEditingTankId(tank.id)
    setShowAdvancedTank(Boolean(tank.headspaceCm || tank.substrateDepthCm || tank.glassThicknessCm))
  }

  function cancelEdit() {
    setEditingTankId(null)
    setDraftTank({ label: "other", volumeLiters: 60 })
    setShowAdvancedTank(false)
  }

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Tanks & calculators</p>
          <h3>Label your tanks</h3>
        </div>
        <span className="pill subtle">Volume + flow</span>
      </div>

      <div className="form-grid" style={{ marginBottom: "var(--space-4)" }}>
        <div className="pair-row">
          <label>
            <span>Name</span>
            <input value={draftTank.name ?? ""} onChange={(e) => setDraftTank({ ...draftTank, name: e.target.value })} placeholder="My planted tank" />
          </label>
          <label>
            <span>Label</span>
            <input
              list="tank-label-suggestions"
              value={draftTank.label ?? ""}
              onChange={(e) => setDraftTank({ ...draftTank, label: e.target.value })}
              onFocus={() => setShowLabelChips(true)}
              onBlur={() => window.setTimeout(() => setShowLabelChips(false), 120)}
              placeholder="e.g. Shrimp, Grow-out"
            />
            <datalist id="tank-label-suggestions">
              {labelSuggestions.map(s => <option key={s} value={s} />)}
            </datalist>
            {showLabelChips && (
              <div className="chip-row">
                {labelSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${draftTank.label === s ? "active" : ""}`}
                    onClick={() => { setDraftTank({ ...draftTank, label: s }); setShowLabelChips(false) }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </label>
        </div>
        <label>
          <span>Length (cm)</span>
          <input type="number" value={draftTank.lengthCm ?? ""} onChange={(e) => setDraftTank({ ...draftTank, lengthCm: Number(e.target.value) })} />
        </label>
        <label>
          <span>Width (cm)</span>
          <input type="number" value={draftTank.widthCm ?? ""} onChange={(e) => setDraftTank({ ...draftTank, widthCm: Number(e.target.value) })} />
        </label>
        <label>
          <span>Height (cm)</span>
          <input type="number" value={draftTank.heightCm ?? ""} onChange={(e) => setDraftTank({ ...draftTank, heightCm: Number(e.target.value) })} />
        </label>
        <div className="row-actions advanced-row">
          <button className="ghost compact" type="button" onClick={() => setShowAdvancedTank(v => !v)}>
            {showAdvancedTank ? "Hide advanced" : "Advanced"}
          </button>
        </div>
        {showAdvancedTank && (
          <>
            <label>
              <span>Headspace (cm, optional)</span>
              <input type="number" value={draftTank.headspaceCm ?? ""} onChange={(e) => setDraftTank({ ...draftTank, headspaceCm: Number(e.target.value) || 0 })} placeholder="Gap from waterline to rim" />
            </label>
            <label>
              <span>Substrate depth (cm, optional)</span>
              <input type="number" value={draftTank.substrateDepthCm ?? ""} onChange={(e) => setDraftTank({ ...draftTank, substrateDepthCm: Number(e.target.value) || 0 })} />
            </label>
            <label>
              <span>Glass thickness (cm, optional)</span>
              <input type="number" value={draftTank.glassThicknessCm ?? ""} onChange={(e) => setDraftTank({ ...draftTank, glassThicknessCm: Number(e.target.value) || 0 })} placeholder="Subtract from all sides" />
            </label>
          </>
        )}
        <div className="suggestion-row">
          <div className="suggestion">
            <p className="muted">Volume (calculated)</p>
            <p><strong>{litersFromDimensions(
              draftTank.lengthCm,
              draftTank.widthCm,
              draftTank.heightCm,
              { headspaceCm: draftTank.headspaceCm, substrateDepthCm: draftTank.substrateDepthCm, glassThicknessCm: draftTank.glassThicknessCm }
            ) || 0} L</strong></p>
          </div>
          <div className="suggestion">
            <p className="muted">Flow suggestion</p>
            <p>
              {(() => {
                const vol = litersFromDimensions(
                  draftTank.lengthCm,
                  draftTank.widthCm,
                  draftTank.heightCm,
                  { headspaceCm: draftTank.headspaceCm, substrateDepthCm: draftTank.substrateDepthCm, glassThicknessCm: draftTank.glassThicknessCm }
                )
                const flow = recommendedFlow(vol)
                return vol
                  ? `Planted ${flow.planted.min}-${flow.planted.max} L/h · Fish-only ${flow.fishOnly.min}-${flow.fishOnly.max} L/h`
                  : "Add dimensions to see"
              })()}
            </p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-4)" }}>
        <button className="primary" onClick={saveTank}>{editingTankId ? "Update tank" : "Save tank"}</button>
        {editingTankId && <button className="ghost" onClick={cancelEdit}>Cancel edit</button>}
      </div>

      <div className="tank-grid" style={{ marginTop: "var(--space-6)" }}>
        {tanks.map((tank) => {
          const calcVolume = tank.volumeLiters || litersFromDimensions(
            tank.lengthCm,
            tank.widthCm,
            tank.heightCm,
            { headspaceCm: tank.headspaceCm, substrateDepthCm: tank.substrateDepthCm, glassThicknessCm: tank.glassThicknessCm }
          )
          const flow = recommendedFlow(calcVolume)
          return (
            <div
              key={tank.id}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                transition: "all var(--transition-base)"
              }}
            >
              {/* Tank Visual Header */}
              <div style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                padding: "var(--space-8) var(--space-5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                minHeight: "140px",
                position: "relative"
              }}>
                <div style={{
                  fontSize: "var(--text-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "var(--space-2)"
                }}>
                  {tank.label}
                </div>
                <h3 style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: "var(--font-bold)",
                  color: "white",
                  margin: 0,
                  marginBottom: "var(--space-2)"
                }}>
                  {tank.name}
                </h3>
                <div style={{
                  fontSize: "var(--text-sm)",
                  color: "rgba(255, 255, 255, 0.9)"
                }}>
                  {calcVolume}L
                </div>
              </div>

              {/* Tank Details */}
              <div style={{ padding: "var(--space-5)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {/* Dimensions */}
                <div>
                  <div style={{ 
                    fontSize: "var(--text-xs)", 
                    color: "var(--text-tertiary)", 
                    marginBottom: "var(--space-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    📏 Dimensions
                  </div>
                  <div style={{ fontSize: "var(--text-base)", color: "var(--text-primary)", fontWeight: "var(--font-semibold)" }}>
                    {tank.lengthCm ?? 0} × {tank.widthCm ?? 0} × {tank.heightCm ?? 0} cm
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
                    Headspace {tank.headspaceCm ?? 0} · Substrate {tank.substrateDepthCm ?? 0} · Glass {tank.glassThicknessCm ?? 0} cm
                  </div>
                </div>

                {/* Flow Rates */}
                <div>
                  <div style={{ 
                    fontSize: "var(--text-xs)", 
                    color: "var(--text-tertiary)", 
                    marginBottom: "var(--space-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    💧 Recommended Flow
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "var(--space-2) var(--space-3)",
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)"
                    }}>
                      🌿 Planted {flow.planted.min}-{flow.planted.max} L/h
                    </span>
                    <span style={{
                      padding: "var(--space-2) var(--space-3)",
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)"
                    }}>
                      🐠 Fish-only {flow.fishOnly.min}-{flow.fishOnly.max} L/h
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--space-2)", 
                  marginTop: "auto",
                  paddingTop: "var(--space-3)",
                  borderTop: "1px solid var(--border)"
                }}>
                  <button
                    type="button"
                    className="secondary"
                    style={{ width: "100%", padding: "var(--space-3)" }}
                    onClick={() => onOpenDetail(tank.id)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    style={{ width: "100%", padding: "var(--space-3)" }}
                    onClick={() => startEdit(tank)}
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    style={{ width: "100%", padding: "var(--space-3)", color: "var(--error)" }}
                    onClick={() => onDelete(tank.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </section>
  )
}
