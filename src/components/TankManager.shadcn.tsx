import { useState } from "react"
import { CaretDown, Eye, PencilSimpleLine, Trash } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

  const calculatedVolume = litersFromDimensions(
    draftTank.lengthCm,
    draftTank.widthCm,
    draftTank.heightCm,
    { headspaceCm: draftTank.headspaceCm, substrateDepthCm: draftTank.substrateDepthCm, glassThicknessCm: draftTank.glassThicknessCm }
  )
  const flow = recommendedFlow(calculatedVolume)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tanks & Calculators
            </div>
            <CardTitle>Label your tanks</CardTitle>
            <Badge variant="outline" className="w-fit">Volume + flow</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tank-name">Name</Label>
              <Input
                id="tank-name"
                value={draftTank.name ?? ""}
                onChange={(e) => setDraftTank({ ...draftTank, name: e.target.value })}
                placeholder="My planted tank"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tank-label">Label</Label>
              <Input
                id="tank-label"
                value={draftTank.label ?? ""}
                onChange={(e) => setDraftTank({ ...draftTank, label: e.target.value })}
                placeholder="e.g. Shrimp, Grow-out"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {labelSuggestions.map(s => (
                  <Badge
                    key={s}
                    variant={draftTank.label === s ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setDraftTank({ ...draftTank, label: s })}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tank-length">Length (cm)</Label>
              <Input
                id="tank-length"
                type="number"
                value={draftTank.lengthCm ?? ""}
                onChange={(e) => setDraftTank({ ...draftTank, lengthCm: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tank-width">Width (cm)</Label>
              <Input
                id="tank-width"
                type="number"
                value={draftTank.widthCm ?? ""}
                onChange={(e) => setDraftTank({ ...draftTank, widthCm: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tank-height">Height (cm)</Label>
              <Input
                id="tank-height"
                type="number"
                value={draftTank.heightCm ?? ""}
                onChange={(e) => setDraftTank({ ...draftTank, heightCm: Number(e.target.value) })}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedTank(v => !v)}
            className="gap-2"
          >
            {showAdvancedTank ? "Hide advanced" : "Show advanced"}
            <CaretDown className={`h-4 w-4 transition-transform ${showAdvancedTank ? 'rotate-180' : ''}`} />
          </Button>

          {showAdvancedTank && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="tank-headspace">Headspace (cm)</Label>
                <Input
                  id="tank-headspace"
                  type="number"
                  value={draftTank.headspaceCm ?? ""}
                  onChange={(e) => setDraftTank({ ...draftTank, headspaceCm: Number(e.target.value) || 0 })}
                  placeholder="Gap from waterline"
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tank-substrate">Substrate depth (cm)</Label>
                <Input
                  id="tank-substrate"
                  type="number"
                  value={draftTank.substrateDepthCm ?? ""}
                  onChange={(e) => setDraftTank({ ...draftTank, substrateDepthCm: Number(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tank-glass">Glass thickness (cm)</Label>
                <Input
                  id="tank-glass"
                  type="number"
                  value={draftTank.glassThicknessCm ?? ""}
                  onChange={(e) => setDraftTank({ ...draftTank, glassThicknessCm: Number(e.target.value) || 0 })}
                  placeholder="Both sides"
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Volume (calculated)</div>
                <div className="text-2xl font-semibold">{calculatedVolume || 0} L</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Flow suggestion</div>
                <div className="text-sm">
                  {calculatedVolume
                    ? `Planted ${flow.planted.min}-${flow.planted.max} L/h · Fish ${flow.fishOnly.min}-${flow.fishOnly.max} L/h`
                    : "Add dimensions to see"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveTank}>
              {editingTankId ? "Update tank" : "Save tank"}
            </Button>
            {editingTankId && (
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
        {tanks.map((tank) => {
          const calcVolume = tank.volumeLiters || litersFromDimensions(
            tank.lengthCm,
            tank.widthCm,
            tank.heightCm,
            { headspaceCm: tank.headspaceCm, substrateDepthCm: tank.substrateDepthCm, glassThicknessCm: tank.glassThicknessCm }
          )
          const flow = recommendedFlow(calcVolume)
          return (
            <Card key={tank.id} className="overflow-hidden flex flex-col">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                  {tank.label}
                </Badge>
                <h3 className="text-2xl font-bold mb-1">{tank.name}</h3>
                <p className="text-lg">{calcVolume}L</p>
              </div>

              <CardContent className="flex-1 flex flex-col gap-4 pt-6">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    📏 Dimensions
                  </div>
                  <div className="font-semibold text-sm">
                    {tank.lengthCm ?? 0} × {tank.widthCm ?? 0} × {tank.heightCm ?? 0} cm
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Headspace {tank.headspaceCm ?? 0} · Substrate {tank.substrateDepthCm ?? 0} · Glass {tank.glassThicknessCm ?? 0} cm
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    💧 Recommended Flow
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">🌿 {flow.planted.min}-{flow.planted.max} L/h</Badge>
                    <Badge variant="outline">🐠 {flow.fishOnly.min}-{flow.fishOnly.max} L/h</Badge>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onOpenDetail(tank.id)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(tank)}
                    title="Edit tank"
                  >
                    <PencilSimpleLine className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(tank.id)}
                    title="Delete tank"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
