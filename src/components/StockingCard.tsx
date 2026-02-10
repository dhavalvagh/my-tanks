import { useState } from "react"
import type { Tank } from "./TankManager"
import type { FishRecord } from "./FishManager"

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
  status: string
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
  status, 
  colors,
  onClick
}: StockingCardProps) {
  const [hoveredFish, setHoveredFish] = useState<FishBioload | null>(null)

  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-1)", 
        border: "1px solid var(--border)", 
        borderRadius: "var(--radius-lg)", 
        boxShadow: "var(--elevation-1)", 
        transition: "all var(--transition-base)",
        cursor: onClick ? "pointer" : "default"
      }}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.boxShadow = "var(--elevation-4)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.boxShadow = "var(--elevation-1)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; } : undefined}
    >
      {/* Tank Visual Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
        padding: "var(--space-8) var(--space-5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: "140px",
        position: "relative"
      }}>
        <div style={{
          fontSize: "var(--text-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: "var(--space-2)"
        }}>
          {tank.label}
        </div>
        <h3 style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          color: "white",
          margin: 0,
          marginBottom: "var(--space-2)"
        }}>
          {tank.name}
        </h3>
        <div style={{
          fontSize: "var(--text-sm)",
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "var(--space-1)"
        }}>
          {tankVolume}L
        </div>
        <div style={{
          fontSize: "var(--text-sm)",
          color: "rgba(255, 255, 255, 0.8)"
        }}>
          {fishInTank.length} species · {fishInTank.reduce((sum, f) => sum + f.count, 0)} fish
        </div>
        <span 
          className={`pill ${status}`} 
          style={{
            position: "absolute",
            top: "var(--space-4)",
            right: "var(--space-4)"
          }}
        >
          {Math.round(ratio * 100)}%
        </span>
      </div>

      {/* Chart Section with Tooltip */}
      <div style={{ padding: "var(--space-5)", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", minHeight: "160px" }}>
        {hoveredFish && (
          <div style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            pointerEvents: "none"
          }}>
            <div style={{
              position: "relative",
              padding: "var(--space-2) var(--space-3)",
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--elevation-4)",
              whiteSpace: "nowrap"
            }}>
              <div style={{ fontWeight: "var(--font-semibold)", fontSize: "var(--text-sm)", marginBottom: "var(--space-1)" }}>
                {hoveredFish.name}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                Count: {hoveredFish.count} · Bioload: {hoveredFish.totalBioload.toFixed(1)} ({((hoveredFish.totalBioload / totalBioload) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
        
        <div style={{ position: "relative", width: "160px", height: "160px" }}>
          <svg viewBox="-10 -10 120 120" style={{ transform: "rotate(-90deg)" }}>
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
                      style={{ 
                        cursor: "pointer",
                        transition: "all var(--transition-base)",
                        filter: hoveredFish === fish 
                          ? "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))" 
                          : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        transform: hoveredFish === fish ? "scale(1.1)" : "scale(1)",
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
                  stroke="var(--surface-1)"
                  strokeWidth="1"
                  style={{ 
                    cursor: "pointer",
                    transition: "all var(--transition-base)",
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
          <div style={{ 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none"
          }}>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)" }}>
              {totalBioload.toFixed(1)}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              / {capacity.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
