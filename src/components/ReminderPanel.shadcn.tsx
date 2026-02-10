import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Tank = { id: string; name: string }

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
  reminders: Reminder[]
  tanks: Tank[]
  onCreate: (input: Omit<Reminder, "id" | "nextDue" | "enabled">) => void
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
}

export default function ReminderPanel({ reminders, tanks, onCreate, onToggle, onDelete }: Props) {
  const [draft, setDraft] = useState<{ 
    title: string
    tankId: string
    type: "water-change" | "feeding"
    everyHours: number 
  }>({
    title: "Water change",
    tankId: "any",
    type: "water-change",
    everyHours: 7 * 24
  })

  function add() {
    if (!draft.title) return
    onCreate({ ...draft, tankId: draft.tankId === "any" ? undefined : draft.tankId })
    setDraft({ ...draft, title: "Water change", tankId: "any" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">Title</Label>
              <Input
                id="reminder-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Reminder title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-type">Type</Label>
              <Select
                value={draft.type}
                onValueChange={(value: "water-change" | "feeding") =>
                  setDraft({ ...draft, type: value })
                }
              >
                <SelectTrigger id="reminder-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water-change">Water change</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-days">Every (days)</Label>
              <Input
                id="reminder-days"
                type="number"
                value={Math.round(draft.everyHours / 24)}
                onChange={(e) =>
                  setDraft({ ...draft, everyHours: Number(e.target.value) * 24 })
                }
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-tank">Tank (optional)</Label>
              <Select
                value={draft.tankId}
                onValueChange={(value) => setDraft({ ...draft, tankId: value })}
              >
                <SelectTrigger id="reminder-tank">
                  <SelectValue placeholder="Any tank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any tank</SelectItem>
                  {tanks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={add} variant="secondary" className="mt-4 w-full">
            Add reminder
          </Button>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No reminders yet.
          </p>
        )}
        {reminders.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {r.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every {Math.round(r.everyHours / 24)} days
                  {r.tankId && ` · ${tanks.find((t) => t.id === r.tankId)?.name ?? ""}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={r.enabled}
                    onCheckedChange={(checked) => onToggle(r.id, checked)}
                    id={`reminder-${r.id}`}
                  />
                  <Label
                    htmlFor={`reminder-${r.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {r.enabled ? "On" : "Off"}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(r.id)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
