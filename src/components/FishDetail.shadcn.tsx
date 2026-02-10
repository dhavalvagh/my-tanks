import { useState } from "react"
import { ArrowLeft, PencilSimpleLine, X, UploadSimple } from "phosphor-react"
import type { FishRecord } from "./FishManager.shadcn"
import type { Tank } from "./TankManager.shadcn"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Fish detail
          </p>
          <h2 className="mt-1 text-3xl font-bold">{fish.name}</h2>
          <p className="mt-1 text-muted-foreground">{tank.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-base">
            ×{fish.count}
          </Badge>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => setEditing(v => !v)}
          >
            {editing ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <PencilSimpleLine className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="species-name">Species name</Label>
                <Input
                  id="species-name"
                  value={draftFish.name ?? ""}
                  onChange={(e) => setDraftFish({ ...draftFish, name: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="count">Count</Label>
                  <Input
                    id="count"
                    type="number"
                    value={draftFish.count ?? ""}
                    onChange={(e) => setDraftFish({ ...draftFish, count: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-size">Max size (cm)</Label>
                  <Input
                    id="max-size"
                    type="number"
                    value={draftFish.maxSizeCm ?? ""}
                    onChange={(e) => setDraftFish({ ...draftFish, maxSizeCm: Number(e.target.value) || null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bioload">Bioload per fish</Label>
                <Input
                  id="bioload"
                  type="number"
                  step="0.1"
                  value={draftFish.bioload ?? ""}
                  onChange={(e) => setDraftFish({ ...draftFish, bioload: Number(e.target.value) || null })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fish-photo">Upload new photo</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('fish-photo')?.click()}
                    type="button"
                    className="w-full"
                  >
                    <UploadSimple className="mr-2 h-4 w-4" />
                    Choose photo
                  </Button>
                  <input
                    id="fish-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                {uploadStatus && (
                  <p className="text-sm text-muted-foreground">{uploadStatus}</p>
                )}
              </div>

              {imagePreview && (
                <div className="overflow-hidden rounded-md border">
                  <img
                    src={imagePreview}
                    alt={fish.name}
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                Save changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  setDraftFish(fish)
                  setImagePreview(fish.imageUrl || null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Fish Image */}
          {fish.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={fish.imageUrl}
                  alt={fish.name}
                  className="h-auto max-h-[400px] w-full rounded-md object-contain"
                />
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Basic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Species</p>
                  <p className="text-lg font-semibold">{fish.name}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Count</p>
                  <p className="text-lg font-semibold">{fish.count}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Tank</p>
                  <p className="text-lg font-semibold">{tank.name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Size & Bioload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Size & Bioload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Max size</p>
                  <p className="text-lg font-semibold">
                    {fish.maxSizeCm ? `${fish.maxSizeCm} cm` : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Bioload per fish</p>
                  <p className="text-lg font-semibold">{calculatedBioload.toFixed(2)}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Total bioload</p>
                  <p className="text-lg font-semibold">{totalBioload.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ({fish.count} × {calculatedBioload.toFixed(2)})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Added</p>
                  <p className="font-medium">
                    {new Date(fish.addedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.floor((Date.now() - fish.addedAt) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onNavigateBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="ml-auto"
            >
              🗑 Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
