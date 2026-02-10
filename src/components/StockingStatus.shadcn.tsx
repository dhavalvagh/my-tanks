import { calculateStocking, litersFromDimensions } from "../services/stocking"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBioloadStatus } from "@/lib/status"

type Tank = {
  id: string
  name: string
  volumeLiters: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  headspaceCm?: number
  substrateDepthCm?: number
  glassThicknessCm?: number
}

type Fish = {
  id: string
  name: string
  count: number
  tankId: string
  maxSizeCm?: number | null
  bioload?: number | null
}

type Props = {
  tanks: Tank[]
  fishes: Fish[]
}

export default function StockingStatus({ tanks, fishes }: Props) {
  if (tanks.length === 0) {
    return <p className="text-muted-foreground">Add tanks to see stocking guidance.</p>
  }

  return (
    <div className="grid gap-4">
      {tanks.map(tank => {
        const tankVolume = tank.volumeLiters || litersFromDimensions(
          tank.lengthCm,
          tank.widthCm,
          tank.heightCm,
          { headspaceCm: tank.headspaceCm, substrateDepthCm: tank.substrateDepthCm, glassThicknessCm: tank.glassThicknessCm }
        )
        const fishInTank = fishes.filter(f => f.tankId === tank.id)
        const result = calculateStocking(tankVolume, fishInTank)
        const percent = Math.min(100, Math.round(result.ratio * 100))
        const statusVariant = getBioloadStatus(result.ratio)

        return (
          <div
            key={tank.id}
            className={cn(
              "rounded-lg border p-4",
              statusVariant === "healthy" && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950",
              statusVariant === "attention" && "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950",
              statusVariant === "warning" && "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950",
              statusVariant === "critical" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tank.name}
                </p>
                <h4 className="mt-1 text-lg font-semibold">{tankVolume} L</h4>
              </div>
              <Badge variant={statusVariant}>{result.status}</Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  statusVariant === "healthy" && "bg-green-500",
                  statusVariant === "attention" && "bg-yellow-500",
                  statusVariant === "warning" && "bg-orange-500",
                  statusVariant === "critical" && "bg-red-500"
                )}
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Bioload {result.load.toFixed(1)} / {result.capacity.toFixed(1)}
            </p>

            {result.warnings.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {result.warnings.map((w, idx) => (
                  <li key={idx}>⚠️ {w}</li>
                ))}
              </ul>
            )}
            {fishInTank.length === 0 && (
              <p className="mt-2 text-sm italic text-muted-foreground">
                No fish assigned to this tank yet.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
