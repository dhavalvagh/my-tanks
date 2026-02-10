import { useState } from "react"
import { ArrowLeft, PencilSimpleLine, X } from "phosphor-react"
import { litersFromDimensions, recommendedFlow } from "../services/stocking"
import type { Tank } from "./TankManager.shadcn"
import type { FishRecord } from "./FishManager.shadcn"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Tank detail
          </p>
          <h2 className="mt-1 text-3xl font-bold">{tank.name}</h2>
          <Badge variant="secondary" className="mt-2">
            {tank.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-base">
            {inlineVolume} L
          </Badge>
          <Button
            variant={detailEditing ? "outline" : "default"}
            onClick={() => setDetailEditing(v => !v)}
          >
            {detailEditing ? (
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

      {detailEditing ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tank-name">Name</Label>
                  <Input
                    id="tank-name"
                    value={detailDraft.name ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tank-label">Label</Label>
                  <Input
                    id="tank-label"
                    value={detailDraft.label ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, label: e.target.value })}
                  />
                </div>
              </div>

              {/* Label Suggestions */}
              <div className="flex flex-wrap gap-2">
                {labelSuggestions.map(s => (
                  <Badge
                    key={s}
                    variant={detailDraft.label === s ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setDetailDraft({ ...detailDraft, label: s })}
                  >
                    {s}
                  </Badge>
                ))}
              </div>

              {/* Dimensions */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={detailDraft.lengthCm ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, lengthCm: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={detailDraft.widthCm ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, widthCm: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={detailDraft.heightCm ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, heightCm: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Adjustments */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="headspace">Headspace (cm)</Label>
                  <Input
                    id="headspace"
                    type="number"
                    value={detailDraft.headspaceCm ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, headspaceCm: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="substrate">Substrate depth (cm)</Label>
                  <Input
                    id="substrate"
                    type="number"
                    value={detailDraft.substrateDepthCm ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, substrateDepthCm: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="glass">Glass thickness (cm)</Label>
                  <Input
                    id="glass"
                    type="number"
                    value={detailDraft.glassThicknessCm ?? ""}
                    onChange={(e) => setDetailDraft({ ...detailDraft, glassThicknessCm: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={detailDraft.notes ?? ""}
                  onChange={(e) => setDetailDraft({ ...detailDraft, notes: e.target.value })}
                  placeholder="Add any notes about this tank..."
                  rows={3}
                />
              </div>

              {/* Calculations Display */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Volume (calculated)</p>
                    <p className="mt-2 text-2xl font-bold">{inlineVolume || 0} L</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Flow recommendation</p>
                    <p className="mt-2 text-sm">
                      Planted {flow.planted.min}-{flow.planted.max} L/h
                    </p>
                    <p className="text-sm">
                      Fish-only {flow.fishOnly.min}-{flow.fishOnly.max} L/h
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={saveDetailInline} className="flex-1">
                Save changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDetailEditing(false)
                  setDetailDraft(tank)
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
          {/* Tank Info Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-2xl font-bold">
                  {tank.lengthCm ?? 0} × {tank.widthCm ?? 0} × {tank.heightCm ?? 0} cm
                </p>
                <p className="text-sm text-muted-foreground">
                  Length × Width × Height
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Headspace: {tank.headspaceCm ?? 0} cm<br />
                  Substrate: {tank.substrateDepthCm ?? 0} cm<br />
                  Glass: {tank.glassThicknessCm ?? 0} cm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Flow rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Planted: {flow.planted.min}-{flow.planted.max} L/h<br />
                  Fish-only: {flow.fishOnly.min}-{flow.fishOnly.max} L/h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {tank.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{tank.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Fish List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  Fish in this tank
                </CardTitle>
                <Badge variant="outline">{fishesInTank.length} species</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {fishesInTank.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No fish assigned to this tank yet.
                </p>
              )}

              <div className="space-y-2">
                {fishesInTank.map(f => (
                  <button
                    key={f.id}
                    onClick={() => onOpenFishDetail && onOpenFishDetail(f.id)}
                    className="flex w-full items-center gap-4 rounded-md bg-muted/50 p-4 text-left transition-colors hover:bg-muted"
                    disabled={!onOpenFishDetail}
                  >
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        alt={f.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                        {f.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-sm text-muted-foreground">Count: {f.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="ghost" onClick={onNavigateToTanks}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tanks
          </Button>
        </div>
      )}
    </div>
  )
}
