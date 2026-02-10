import { useState, useEffect } from "react"
import SpeciesAutocomplete from "./SpeciesAutocomplete"

export type FishRecord = {
  id: string
  name: string
  count: number
  tankId: string
  imageUrl?: string
  maxSizeCm?: number | null
  bioload?: number | null
  addedAt: number
}

type Tank = {
  id: string
  name: string
}

type Props = {
  tanks: Tank[]
  userId: string | null
  fishes: FishRecord[]
  editFishId?: string | null
  onSave: (fish: FishRecord) => void
  onDelete: (fishId: string) => void
  onUploadImage: (file: File) => Promise<string | undefined>
  tankNameLookup: (id: string) => string
}

export default function FishManager({ tanks, userId, fishes, editFishId, onSave, onDelete: _onDelete, onUploadImage, tankNameLookup: _tankNameLookup }: Props) {
  const [draftFish, setDraftFish] = useState<Partial<FishRecord>>({ count: 6 })
  const [editingFishId, setEditingFishId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Trigger edit when editFishId prop changes
  useEffect(() => {
    if (editFishId) {
      const fish = fishes.find(f => f.id === editFishId)
      if (fish) {
        startEdit(fish)
      }
    }
  }, [editFishId, fishes])

  async function saveFish() {
    if (!draftFish.name || !draftFish.tankId || !draftFish.count) return

    const fishData: FishRecord = {
      id: editingFishId || crypto.randomUUID(),
      name: draftFish.name,
      count: Number(draftFish.count),
      tankId: draftFish.tankId,
      imageUrl: draftFish.imageUrl,
      maxSizeCm: draftFish.maxSizeCm ?? null,
      bioload: draftFish.bioload ?? null,
      addedAt: draftFish.addedAt ?? Date.now()
    }

    onSave(fishData)
    setDraftFish({ count: 6 })
    setEditingFishId(null)
    setImagePreview(null)
    setShowAdvanced(false)
  }

  function startEdit(fish: FishRecord) {
    setDraftFish({
      name: fish.name,
      count: fish.count,
      tankId: fish.tankId,
      imageUrl: fish.imageUrl,
      maxSizeCm: fish.maxSizeCm,
      bioload: fish.bioload,
      addedAt: fish.addedAt
    })
    setEditingFishId(fish.id)
    setImagePreview(fish.imageUrl || null)
  }

  function cancelEdit() {
    setEditingFishId(null)
    setDraftFish({ count: 6 })
    setImagePreview(null)
    setShowAdvanced(false)
  }

  async function handleUploadImage(file: File) {
    if (!userId) return
    setUploadStatus("Uploading photo…")
    const url = await onUploadImage(file)
    setUploadStatus("")
    if (url) {
      setDraftFish(prev => ({ ...prev, imageUrl: url }))
      setImagePreview(url)
    }
  }



  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Fish & photos</p>
          <h3>Add fish with autocomplete</h3>
        </div>
        <span className="pill subtle">Upload photos</span>
      </div>

      <div className="form-grid" style={{ marginBottom: "var(--space-4)" }}>
        <label className="full">
          <span>Species</span>
          <SpeciesAutocomplete
            value={draftFish.name ?? ""}
            onChange={(v, meta) => setDraftFish(prev => ({ ...prev, name: v, maxSizeCm: meta?.maxSizeCm ?? prev.maxSizeCm, bioload: meta?.bioload ?? prev.bioload }))}
          />
        </label>
        <label>
          <span>Count</span>
          <input type="number" value={draftFish.count ?? ""} onChange={(e) => setDraftFish({ ...draftFish, count: Number(e.target.value) })} />
        </label>
        <label>
          <span>Tank</span>
          <select value={draftFish.tankId ?? ""} onChange={(e) => setDraftFish({ ...draftFish, tankId: e.target.value })}>
            <option value="">Select a tank</option>
            {tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      <details open={showAdvanced} onToggle={(e) => setShowAdvanced(e.currentTarget.open)} style={{ marginBottom: "var(--space-4)" }}>
        <summary style={{ cursor: "pointer", fontWeight: "var(--font-semibold)", marginBottom: "var(--space-3)", userSelect: "none" }}>
          ⚙️ Advanced Options
        </summary>
        <div className="form-grid">
          <label>
            <span>Max size (cm)</span>
            <input 
              type="number" 
              step="0.1"
              value={draftFish.maxSizeCm ?? ""} 
              onChange={(e) => setDraftFish({ ...draftFish, maxSizeCm: e.target.value ? Number(e.target.value) : null })}
              placeholder="Auto from species"
            />
          </label>
          <label>
            <span>Bioload per fish</span>
            <input 
              type="number" 
              step="0.1"
              value={draftFish.bioload ?? ""} 
              onChange={(e) => setDraftFish({ ...draftFish, bioload: e.target.value ? Number(e.target.value) : null })}
              placeholder="Auto calculated"
            />
          </label>
          <label className="full">
            <span>Date added</span>
            <input 
              type="date" 
              value={draftFish.addedAt ? new Date(draftFish.addedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
              onChange={(e) => setDraftFish({ ...draftFish, addedAt: new Date(e.target.value).getTime() })}
            />
          </label>
          <div className="full" style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginTop: "var(--space-2)" }}>
            <p>💡 <strong>Max size</strong> and <strong>bioload</strong> are auto-filled from species database.</p>
            <p style={{ marginTop: "var(--space-1)" }}>Override them here if you have more accurate values.</p>
          </div>
        </div>
      </details>

      <div className="image-actions" style={{ marginTop: "var(--space-4)" }}>
        <label className="ghost file">
          Upload your photo
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])} />
        </label>
      </div>

      {uploadStatus && <p className="muted" style={{ marginTop: "var(--space-3)" }}>{uploadStatus}</p>}
      {imagePreview && <img className="preview" src={imagePreview} alt="Selected" style={{ marginTop: "var(--space-3)" }} />}

      <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
        <button className="primary" onClick={saveFish}>{editingFishId ? "Update fish" : "Save fish"}</button>
        {editingFishId && <button className="ghost" onClick={cancelEdit}>Cancel edit</button>}
      </div>
    </section>
  )
}
