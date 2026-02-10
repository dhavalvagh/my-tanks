import type { ReactNode } from "react"
import { litersFromDimensions } from "../services/stocking"
import type { Tank } from "./TankManager.shadcn"
import type { FishRecord } from "./FishManager.shadcn"
import StockingCard from "./StockingCard.shadcn"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendUp, TrendDown, Minus } from "phosphor-react"

type Props = {
  tanks: Tank[]
  fishes: FishRecord[]
  onOpenTankDetail: (tankId: string) => void
  onOpenFishDetail: (fishId: string) => void
}

export default function Dashboard({ tanks, fishes, onOpenTankDetail, onOpenFishDetail }: Props) {
  // Deterministic ordering for stable layout
  const orderedFishes = [...fishes].sort((a, b) => a.name.localeCompare(b.name))
  const orderedTanks = [...tanks].sort((a, b) => a.name.localeCompare(b.name))

  const totalFish = fishes.reduce((sum, f) => sum + f.count, 0)
  const totalVolume = tanks.reduce((sum, t) => {
    const vol = t.volumeLiters || litersFromDimensions(
      t.lengthCm,
      t.widthCm,
      t.heightCm,
      { headspaceCm: t.headspaceCm, substrateDepthCm: t.substrateDepthCm, glassThicknessCm: t.glassThicknessCm }
    )
    return sum + (vol || 0)
  }, 0)

  const uniqueSpecies = new Set(fishes.map(f => f.name)).size

  return (
    <div className="space-y-6">
      {/* Stats Cards - Top Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon="🐠"
          value={tanks.length} 
          label="Total Tanks"
        />
        <StatCard 
          icon="🐟"
          value={totalFish} 
          label="Total Fish"
        />
        <StatCard 
          icon="🌿"
          value={uniqueSpecies} 
          label="Unique Species" 
        />
        <StatCard 
          icon="💧"
          value={`${totalVolume}L`} 
          label="Total Volume" 
        />
      </div>

      {/* Tanks and Fish Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Your Tanks with Stocking Status */}
        <SectionCard
          title="Your Tanks"
          subtitle="Click any tank to view details · Bioload status shown"
        >
          {orderedTanks.length === 0 ? (
            <EmptyState 
              icon="🐠"
              title="No tanks yet"
              description="Add your first tank to get started"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orderedTanks.map(tank => {
                const tankVolume = tank.volumeLiters || litersFromDimensions(
                  tank.lengthCm,
                  tank.widthCm,
                  tank.heightCm,
                  { headspaceCm: tank.headspaceCm, substrateDepthCm: tank.substrateDepthCm, glassThicknessCm: tank.glassThicknessCm }
                )
                const fishInTank = fishes.filter(f => f.tankId === tank.id)
                
                // If tank has fish, show stocking card with bioload
                if (fishInTank.length > 0) {
                  const fishBioloads = fishInTank.map(f => {
                    const size = Number(f.maxSizeCm ?? 5)
                    const bioload = Number(f.bioload ?? Math.max(0.3, (size / 5) * 0.5))
                    return {
                      name: f.name,
                      count: f.count,
                      bioloadPerFish: bioload,
                      totalBioload: bioload * f.count,
                      imageUrl: f.imageUrl
                    }
                  })

                  const totalBioload = fishBioloads.reduce((sum, f) => sum + f.totalBioload, 0)
                  const capacity = Math.max(tankVolume, 1)
                  const ratio = totalBioload / capacity
                  const colors = ["#1e88e5", "#26a69a", "#66bb6a", "#ffa726", "#ef5350", "#29b6f6", "#ab47bc", "#ec407a"]

                  return (
                    <StockingCard
                      key={tank.id}
                      tank={tank}
                      tankVolume={tankVolume}
                      fishInTank={fishInTank}
                      fishBioloads={fishBioloads}
                      totalBioload={totalBioload}
                      capacity={capacity}
                      ratio={ratio}
                      colors={colors}
                      onClick={() => onOpenTankDetail(tank.id)}
                    />
                  )
                }
                
                // If tank has no fish, show simple tank card
                return (
                  <TankCard
                    key={tank.id}
                    name={tank.name}
                    label={tank.label}
                    volumeLiters={tankVolume}
                    onClick={() => onOpenTankDetail(tank.id)}
                  />
                )
              })}
            </div>
          )}
        </SectionCard>

        {/* Fish Roster */}
        <SectionCard
          title="Fish Roster"
          subtitle={`${orderedFishes.length} entries across all tanks`}
        >
          {orderedFishes.length === 0 ? (
            <EmptyState 
              icon="🐟"
              title="No fish yet"
              description="Add fish to your tanks to see them here"
            />
          ) : (
            <div className="space-y-2">
              {orderedFishes.map(f => {
                const fishTank = tanks.find(t => t.id === f.tankId)
                return (
                  <FishListItem
                    key={f.id}
                    name={f.name}
                    count={f.count}
                    tankName={fishTank?.name ?? "Unknown"}
                    imageUrl={f.imageUrl}
                    onClick={() => onOpenFishDetail(f.id)}
                  />
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

type SectionCardProps = {
  title: string
  subtitle?: string
  badge?: string
  children: ReactNode
}

function SectionCard({ title, subtitle, badge, children }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {badge && <Badge variant="outline">{badge}</Badge>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

type StatCardProps = {
  icon: ReactNode
  label: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down" | "neutral"
  }
}

function StatCard({ icon, label, value, change }: StatCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-muted-foreground"
  }

  const TrendIcon = change?.trend === "up" ? TrendUp : change?.trend === "down" ? TrendDown : Minus

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary">{icon}</div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trendColors[change.trend]}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type TankCardProps = {
  name: string
  label: string
  volumeLiters: number
  onClick: () => void
}

function TankCard({ name, label, volumeLiters, onClick }: TankCardProps) {
  return (
    <Button
      variant="ghost"
      className="h-auto w-full p-0 hover:bg-transparent"
      onClick={onClick}
    >
      <Card className="w-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
          <Badge variant="secondary" className="mb-2 border-0 bg-white/20 text-white">
            {label}
          </Badge>
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-sm">{volumeLiters}L</p>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Click to view details</p>
        </CardContent>
      </Card>
    </Button>
  )
}

type FishListItemProps = {
  name: string
  count: number
  tankName: string
  imageUrl?: string
  onClick: () => void
}

function FishListItem({ name, count, tankName, imageUrl, onClick }: FishListItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 p-3 hover:bg-muted"
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl">🐠</span>
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <h4 className="truncate font-semibold">{name}</h4>
          <p className="truncate text-sm text-muted-foreground">
            {tankName} · {count} {count === 1 ? "fish" : "fishes"}
          </p>
        </div>
        <Badge variant="outline" className="flex-shrink-0">
          {count}
        </Badge>
      </div>
    </Button>
  )
}

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {icon && <div className="mb-4 text-5xl opacity-50">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
