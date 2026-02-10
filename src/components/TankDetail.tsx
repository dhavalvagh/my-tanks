import { useState } from "react"
import { litersFromDimensions, recommendedFlow } from "../services/stocking"
import type { Tank } from "./TankManager"
import type { FishRecord } from "./FishManager"

type Props = {
  tank: Tank
  fishes: FishRecord[]
  onSave: (tank: Tank) => void
  onNavigateToTanks: () => void
  onOpenFishDetail?: (fishId: string) => void
}

export default function TankDetail({ tank, fishes, onSave, onNavigateToTanks, onOpenFishDetail }: Props) {
  const [detailDraft, setDetailDraft] = useState<Partial<Tank>>(() => ({
    name: tank.name,
    label: tank.label,
    lengthCm: tank.lengthCm,
    widthCm: tank.widthCm,
    heightCm: tank.heightCm,
    headspaceCm: tank.headspaceCm,
    substrateDepthCm: tank.substrateDepthCm,
    glassThicknessCm: tank.glassThicknessCm,
    notes: tank.notes
  }))
  const [detailEditing, setDetailEditing] = useState(false)
  const [showLabelChipsDetail, setShowLabelChipsDetail] = useState(false)

  const labelSuggestions = ["Small", "Big", "Quarantine", "Display", "Shrimp", "Grow-out"]

  const calcVolume = tank.volumeLiters || litersFromDimensions(
    tank.lengthCm,
    tank.widthCm,
    tank.heightCm,
    { headspaceCm: tank.headspaceCm, substrateDepthCm: tank.substrateDepthCm, glassThicknessCm: tank.glassThicknessCm }
  )

  const inlineVolume = detailEditing
    ? litersFromDimensions(
        detailDraft.lengthCm,
        detailDraft.widthCm,
        detailDraft.heightCm,
        { headspaceCm: detailDraft.headspaceCm, substrateDepthCm: detailDraft.substrateDepthCm, glassThicknessCm: detailDraft.glassThicknessCm }
      )
    : calcVolume

  const flow = recommendedFlow(inlineVolume)
  const fishesInTank = fishes.filter(f => f.tankId === tank.id)

  function saveDetailInline() {
    if (!detailDraft.name) return
    const volume = litersFromDimensions(
      detailDraft.lengthCm,
      detailDraft.widthCm,
      detailDraft.heightCm,
      { headspaceCm: detailDraft.headspaceCm, substrateDepthCm: detailDraft.substrateDepthCm, glassThicknessCm: detailDraft.glassThicknessCm }
    )
    if (!volume) return
    const flowRate = recommendedFlow(volume).fishOnly.min

    const updatedTank: Tank = {
      id: tank.id,
      name: detailDraft.name,
      label: detailDraft.label ?? "other",
      lengthCm: detailDraft.lengthCm,
      widthCm: detailDraft.widthCm,
      heightCm: detailDraft.heightCm,
      headspaceCm: detailDraft.headspaceCm,
      substrateDepthCm: detailDraft.substrateDepthCm,
      glassThicknessCm: detailDraft.glassThicknessCm,
      volumeLiters: volume,
      flowRateLph: flowRate,
      notes: detailDraft.notes
    }

    onSave(updatedTank)
    setDetailEditing(false)
  }

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Tank detail</p>
          <h3>{tank.name}</h3>
          <p className="muted">{tank.label}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span className="pill primary">{inlineVolume} L</span>
          <button className="text compact" type="button" onClick={() => setDetailEditing(v => !v)}>
            {detailEditing ? "Cancel" : "✎ Edit"}
          </button>
        </div>
      </div>

      {detailEditing ? (
        <>
          <div className="form-grid" style={{ marginTop: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div className="pair-row">
              <label>
                <span>Name</span>
                <input value={detailDraft.name ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, name: e.target.value })} />
              </label>
              <label>
                <span>Label</span>
                <input
                  list="tank-label-suggestions"
                  value={detailDraft.label ?? ""}
                  onChange={(e) => setDetailDraft({ ...detailDraft, label: e.target.value })}
                  onFocus={() => setShowLabelChipsDetail(true)}
                  onBlur={() => window.setTimeout(() => setShowLabelChipsDetail(false), 120)}
                />
                <datalist id="tank-label-suggestions">
                  {labelSuggestions.map(s => <option key={s} value={s} />)}
                </datalist>
                {showLabelChipsDetail && (
                  <div className="chip-row">
                    {labelSuggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`chip ${detailDraft.label === s ? "active" : ""}`}
                        onClick={() => { setDetailDraft({ ...detailDraft, label: s }); setShowLabelChipsDetail(false) }}
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
              <input type="number" value={detailDraft.lengthCm ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, lengthCm: Number(e.target.value) })} />
            </label>
            <label>
              <span>Width (cm)</span>
              <input type="number" value={detailDraft.widthCm ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, widthCm: Number(e.target.value) })} />
            </label>
            <label>
              <span>Height (cm)</span>
              <input type="number" value={detailDraft.heightCm ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, heightCm: Number(e.target.value) })} />
            </label>
            <label>
              <span>Headspace (cm)</span>
              <input type="number" value={detailDraft.headspaceCm ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, headspaceCm: Number(e.target.value) || 0 })} />
            </label>
            <label>
              <span>Substrate depth (cm)</span>
              <input type="number" value={detailDraft.substrateDepthCm ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, substrateDepthCm: Number(e.target.value) || 0 })} />
            </label>
            <label>
              <span>Glass thickness (cm)</span>
              <input type="number" value={detailDraft.glassThicknessCm ?? ""} onChange={(e) => setDetailDraft({ ...detailDraft, glassThicknessCm: Number(e.target.value) || 0 })} />
            </label>
            <div className="suggestion-row">
              <div className="suggestion">
                <p className="muted">Volume (calculated)</p>
                <p><strong>{inlineVolume || 0} L</strong></p>
              </div>
              <div className="suggestion">
                <p className="muted">Flow recommendation</p>
                <p>Planted {flow.planted.min}-{flow.planted.max} L/h</p>
                <p>Fish-only {flow.fishOnly.min}-{flow.fishOnly.max} L/h</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <button className="primary" type="button" onClick={saveDetailInline}>Save changes</button>
            <button className="ghost" type="button" onClick={() => { setDetailEditing(false); setDetailDraft(tank) }}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)" }}>
              <p className="eyebrow">Dimensions</p>
              <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", margin: "var(--space-2) 0" }}>
                {tank.lengthCm ?? 0} × {tank.widthCm ?? 0} × {tank.heightCm ?? 0} cm
              </p>
              <p className="muted" style={{ fontSize: "var(--text-sm)" }}>Length × Width × Height</p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)" }}>
              <p className="eyebrow">Adjustments</p>
              <p style={{ fontSize: "var(--text-sm)", margin: "var(--space-2) 0" }}>
                Headspace: {tank.headspaceCm ?? 0} cm<br />
                Substrate: {tank.substrateDepthCm ?? 0} cm<br />
                Glass: {tank.glassThicknessCm ?? 0} cm
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)" }}>
              <p className="eyebrow">Flow rates</p>
              <p style={{ fontSize: "var(--text-sm)", margin: "var(--space-2) 0" }}>
                Planted: {flow.planted.min}-{flow.planted.max} L/h<br />
                Fish-only: {flow.fishOnly.min}-{flow.fishOnly.max} L/h
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-0)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <p className="eyebrow">Fish in this tank</p>
              <span className="pill subtle">{fishesInTank.length} species</span>
            </div>
            {fishesInTank.length === 0 && <p className="muted">No fish assigned to this tank yet.</p>}
            <div className="mini-list">
              {fishesInTank.map(f => (
                <div 
                  key={f.id} 
                  className="list-row" 
                  style={{ cursor: onOpenFishDetail ? "pointer" : "default" }}
                  onClick={() => onOpenFishDetail && onOpenFishDetail(f.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    {f.imageUrl ? (
                      <img src={f.imageUrl} className="thumb" alt="fish" />
                    ) : (
                      <div style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "var(--radius-md)", 
                        background: "var(--primary)", 
                        color: "var(--primary-contrast)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontWeight: "var(--font-bold)", 
                        fontSize: "var(--text-lg)" 
                      }}>
                        {f.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong>{f.name}</strong>
                      <p className="muted" style={{ fontSize: "var(--text-sm)" }}>Count: {f.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <button className="ghost" type="button" onClick={onNavigateToTanks}>← Back to tanks</button>
          </div>
        </>
      )}
    </section>
  )
}
