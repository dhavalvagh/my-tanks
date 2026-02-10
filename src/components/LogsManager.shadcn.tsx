import { useMemo, useState } from "react"
import { Drop, ForkKnife } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReminderPanel from "./ReminderPanel.shadcn"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide">
            Maintenance logs
          </div>
          <h2 className="text-2xl font-bold">Water changes & feeding</h2>
          <p className="text-sm text-muted-foreground">
            Track maintenance schedule and set reminders
          </p>
        </div>
        <Badge variant="default">Browser notifications</Badge>
      </div>

      {/* Log Forms */}
      <div className="grid grid-cols-2 gap-6">
        {/* Water Change Form */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide">
              Log water change
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="water-tank">Tank</Label>
                <Select
                  value={draftWater.tankId}
                  onValueChange={(value) => setDraftWater({ ...draftWater, tankId: value })}
                >
                  <SelectTrigger id="water-tank">
                    <SelectValue placeholder="Select a tank" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="water-percent">Percent changed</Label>
                <Input
                  id="water-percent"
                  type="number"
                  value={draftWater.percent}
                  onChange={(e) => setDraftWater({ ...draftWater, percent: Number(e.target.value) })}
                />
              </div>
              <Button 
                onClick={handleLogWaterChange}
                className="w-full gap-2"
              >
                <Drop className="h-4 w-4" />
                Log water change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feeding Form */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-xs font-semibold text-secondary uppercase tracking-wide">
              Log feeding
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feed-tank">Tank</Label>
                <Select
                  value={draftFeed.tankId}
                  onValueChange={(value) => setDraftFeed({ ...draftFeed, tankId: value })}
                >
                  <SelectTrigger id="feed-tank">
                    <SelectValue placeholder="Select a tank" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feed-food">Food type</Label>
                <Input
                  id="feed-food"
                  value={draftFeed.food}
                  onChange={(e) => setDraftFeed({ ...draftFeed, food: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleLogFeeding}
                className="w-full gap-2"
                variant="secondary"
              >
                <ForkKnife className="h-4 w-4" />
                Log feeding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Maintenance */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Last maintenance per tank
            </div>
            <Badge variant="outline">{tanks.length} tanks</Badge>
          </div>
          <div className="space-y-3">
            {tanks.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tanks yet. Add a tank to start tracking.
              </p>
            )}
            {tanks.map(t => (
              <div 
                key={t.id}
                className="p-3 rounded-lg bg-muted/30"
              >
                <h3 className="font-semibold mb-1">{t.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Water: {lastWaterChange[t.id] ?? "Not yet logged"} · Feeding: {lastFeeding[t.id] ?? "Not yet logged"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-xs font-semibold text-warning uppercase tracking-wide">
            ⏰ Reminders
          </div>
          <ReminderPanel
            tanks={tanks}
            reminders={reminders}
            onCreate={onCreateReminder}
            onToggle={onToggleReminder}
            onDelete={onDeleteReminder}
          />
        </CardContent>
      </Card>
    </div>
  )
}
