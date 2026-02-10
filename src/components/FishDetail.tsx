import { useState } from "react"
import type { FishRecord } from "./FishManager"
import type { Tank } from "./TankManager"

type Props = {
  fish: FishRecord
  tank: Tank
  onSave: (fish: FishRecord) => void
  onDelete: (fishId: string) => void
  onUploadImage: (file: File) => Promise<string | undefined>
  onNavigateBack: () => void
}

export default function FishDetail({ fish, tank, onSave, onDelete, onUploadImage, onNavigateBack }: Props) {
  const [editing, setEditing] = useState(false)
  const [draftFish, setDraftFish] = useState<Partial<FishRecord>>(() => ({
    name: fish.name,
    count: fish.count,
    tankId: fish.tankId,
    imageUrl: fish.imageUrl,
    maxSizeCm: fish.maxSizeCm,
    bioload: fish.bioload
  }))
  const [uploadStatus, setUploadStatus] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(fish.imageUrl || null)

  async function handleUploadImage(file: File) {
    setUploadStatus("Uploading photo…")
    const url = await onUploadImage(file)
    setUploadStatus("")
    if (url) {
      setDraftFish(prev => ({ ...prev, imageUrl: url }))
      setImagePreview(url)
    }
  }

  function handleSave() {
    if (!draftFish.name || !draftFish.count) return
    
    const updatedFish: FishRecord = {
      id: fish.id,
      name: draftFish.name,
      count: Number(draftFish.count),
      tankId: draftFish.tankId || fish.tankId,
      imageUrl: draftFish.imageUrl,
      maxSizeCm: draftFish.maxSizeCm ?? null,
      bioload: draftFish.bioload ?? null,
      addedAt: fish.addedAt
    }
    
    onSave(updatedFish)
    setEditing(false)
  }

  function handleDelete() {
    if (confirm(`Delete ${fish.name}? This action cannot be undone.`)) {
      onDelete(fish.id)
      onNavigateBack()
    }
  }

  const calculatedBioload = fish.bioload ?? Math.max(0.3, ((fish.maxSizeCm ?? 5) / 5) * 0.5)
  const totalBioload = calculatedBioload * fish.count

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Fish detail</p>
          <h3>{fish.name}</h3>
          <p className="muted">{tank.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span className="pill primary">×{fish.count}</span>
          <button className="text compact" type="button" onClick={() => setEditing(v => !v)}>
            {editing ? "Cancel" : "✎ Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        <>
          <div className="form-grid" style={{ marginTop: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <label className="full">
              <span>Species name</span>
              <input value={draftFish.name ?? ""} onChange={(e) => setDraftFish({ ...draftFish, name: e.target.value })} />
            </label>
            <label>
              <span>Count</span>
              <input type="number" value={draftFish.count ?? ""} onChange={(e) => setDraftFish({ ...draftFish, count: Number(e.target.value) })} />
            </label>
            <label>
              <span>Max size (cm)</span>
              <input type="number" value={draftFish.maxSizeCm ?? ""} onChange={(e) => setDraftFish({ ...draftFish, maxSizeCm: Number(e.target.value) || null })} />
            </label>
            <label className="full">
              <span>Bioload per fish</span>
              <input type="number" step="0.1" value={draftFish.bioload ?? ""} onChange={(e) => setDraftFish({ ...draftFish, bioload: Number(e.target.value) || null })} />
            </label>

            <div className="full" style={{ marginTop: "var(--space-3)" }}>
              <label className="ghost file">
                Upload new photo
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])} />
              </label>
            </div>

            {uploadStatus && <p className="muted" style={{ marginTop: "var(--space-3)" }}>{uploadStatus}</p>}
            {imagePreview && <img className="preview" src={imagePreview} alt={fish.name} style={{ marginTop: "var(--space-3)", gridColumn: "1 / -1" }} />}
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <button className="primary" type="button" onClick={handleSave}>Save changes</button>
            <button className="ghost" type="button" onClick={() => { setEditing(false); setDraftFish(fish); setImagePreview(fish.imageUrl || null) }}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            {/* Fish Image */}
            {fish.imageUrl && (
              <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)", gridColumn: "1 / -1" }}>
                <p className="eyebrow" style={{ marginBottom: "var(--space-3)" }}>Photo</p>
                <img 
                  src={fish.imageUrl} 
                  alt={fish.name} 
                  style={{ 
                    width: "100%", 
                    maxHeight: "300px", 
                    objectFit: "contain", 
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-3)"
                  }} 
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)" }}>
              <p className="eyebrow">Basic Info</p>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Species</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>{fish.name}</p>
              </div>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Count</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>{fish.count}</p>
              </div>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Tank</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>{tank.name}</p>
              </div>
            </div>

            {/* Size & Bioload */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)" }}>
              <p className="eyebrow">Size & Bioload</p>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Max size</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
                  {fish.maxSizeCm ? `${fish.maxSizeCm} cm` : "Not specified"}
                </p>
              </div>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Bioload per fish</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
                  {calculatedBioload.toFixed(2)}
                </p>
              </div>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Total bioload</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
                  {totalBioload.toFixed(2)}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
                  ({fish.count} × {calculatedBioload.toFixed(2)})
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--surface-2)" }}>
              <p className="eyebrow">Timeline</p>
              <div style={{ marginTop: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Added</p>
                <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-medium)" }}>
                  {new Date(fish.addedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
                  {Math.floor((Date.now() - fish.addedAt) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <button className="ghost" type="button" onClick={onNavigateBack}>← Back</button>
            <button className="ghost" type="button" onClick={handleDelete} style={{ marginLeft: "auto", color: "var(--error)" }}>
              🗑 Delete
            </button>
          </div>
        </>
      )}
    </section>
  )
}
