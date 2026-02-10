import { useState } from "react"
import type { Tank } from "./TankManager.shadcn"
import type { FishRecord } from "./FishManager.shadcn"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type FishBioload = {
  name: string
  count: number
  bioloadPerFish: number
  totalBioload: number
  imageUrl?: string
}

type StockingCardProps = {
  tank: Tank
  tankVolume: number
  fishInTank: FishRecord[]
  fishBioloads: FishBioload[]
  totalBioload: number
  capacity: number
  ratio: number
  colors: string[]
  onClick?: () => void
}

export default function StockingCard({ 
  tank, 
  tankVolume, 
  fishInTank, 
  fishBioloads, 
  totalBioload, 
  capacity, 
  ratio, 
  colors,
  onClick
}: StockingCardProps) {
  const [hoveredFish, setHoveredFish] = useState<FishBioload | null>(null)

  return (
    <div 
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-lg border bg-card shadow-md transition-all",
        onClick && "cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:border-primary"
      )}
    >
      {/* Tank Visual Header */}
      <div className="relative flex min-h-[140px] flex-col items-start justify-center bg-gradient-to-br from-primary to-primary/80 p-8 px-6">
        <div className="mb-2 text-xs uppercase tracking-widest text-white/80">
          {tank.label}
        </div>
        <h3 className="mb-2 text-2xl font-bold text-white">
          {tank.name}
        </h3>
        <div className="mb-1 text-sm text-white/90">
          {tankVolume}L
        </div>
        <div className="text-sm text-white/80">
          {fishInTank.length} species · {fishInTank.reduce((sum, f) => sum + f.count, 0)} fish
        </div>
        <Badge
          variant="secondary"
          className="absolute right-4 top-4 bg-white/20 text-white hover:bg-white/30"
        >
          {Math.round(ratio * 100)}%
        </Badge>
      </div>

      {/* Chart Section with Tooltip */}
      <div className="relative flex min-h-[160px] items-center justify-center p-6">
        {hoveredFish && (
          <div className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2">
            <div className="relative whitespace-nowrap rounded-md border bg-popover p-2 px-3 shadow-lg">
              <div className="mb-1 text-sm font-semibold">
                {hoveredFish.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Count: {hoveredFish.count} · Bioload: {hoveredFish.totalBioload.toFixed(1)} ({((hoveredFish.totalBioload / totalBioload) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
        
        <div className="relative h-40 w-40">
          <svg viewBox="-10 -10 120 120" className="-rotate-90">
            {fishBioloads.map((fish, idx) => {
              const percentage = (fish.totalBioload / totalBioload) * 100
              const startPercentage = fishBioloads
                .slice(0, idx)
                .reduce((sum, f) => sum + (f.totalBioload / totalBioload) * 100, 0)
              
              const startAngle = (startPercentage / 100) * 360
              const endAngle = ((startPercentage + percentage) / 100) * 360
              const largeArcFlag = percentage > 50 ? 1 : 0

              const outerRadius = 45
              const innerRadius = 28

              // Special case: if this segment is 100% (or very close), draw it as a complete ring
              if (percentage >= 99.9) {
                return (
                  <g key={idx}>
                    <circle
                      cx="50"
                      cy="50"
                      r={outerRadius}
                      fill="none"
                      stroke={colors[idx % colors.length]}
                      strokeWidth={outerRadius - innerRadius}
                      className={cn(
                        "cursor-pointer transition-all",
                        hoveredFish === fish && "scale-110 drop-shadow-lg"
                      )}
                      style={{
                        filter: hoveredFish === fish 
                          ? "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))" 
                          : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        transformOrigin: "center"
                      }}
                      onMouseEnter={() => setHoveredFish(fish)}
                      onMouseLeave={() => setHoveredFish(null)}
                    />
                  </g>
                )
              }

              // Outer arc points
              const outerStartX = 50 + outerRadius * Math.cos((Math.PI * startAngle) / 180)
              const outerStartY = 50 + outerRadius * Math.sin((Math.PI * startAngle) / 180)
              const outerEndX = 50 + outerRadius * Math.cos((Math.PI * endAngle) / 180)
              const outerEndY = 50 + outerRadius * Math.sin((Math.PI * endAngle) / 180)

              // Inner arc points
              const innerStartX = 50 + innerRadius * Math.cos((Math.PI * startAngle) / 180)
              const innerStartY = 50 + innerRadius * Math.sin((Math.PI * startAngle) / 180)
              const innerEndX = 50 + innerRadius * Math.cos((Math.PI * endAngle) / 180)
              const innerEndY = 50 + innerRadius * Math.sin((Math.PI * endAngle) / 180)

              return (
                <path
                  key={idx}
                  d={`
                    M ${outerStartX} ${outerStartY}
                    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
                    L ${innerEndX} ${innerEndY}
                    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
                    Z
                  `}
                  fill={colors[idx % colors.length]}
                  stroke="hsl(var(--card))"
                  strokeWidth="1"
                  className="cursor-pointer transition-all"
                  style={{ 
                    filter: hoveredFish === fish 
                      ? "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))" 
                      : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    transform: hoveredFish === fish ? "scale(1.1)" : "scale(1)",
                    transformOrigin: "center"
                  }}
                  onMouseEnter={() => setHoveredFish(fish)}
                  onMouseLeave={() => setHoveredFish(null)}
                />
              )
            })}
          </svg>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-2xl font-bold">
              {totalBioload.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              / {capacity.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
