import { litersFromDimensions } from "../services/stocking"
import type { Tank } from "./TankManager"
import type { FishRecord } from "./FishManager"
import StockingCard from "./StockingCard"
import StatCard from "./dashboard/StatCard"
import TankCard from "./dashboard/TankCard"
import FishListItem from "./dashboard/FishListItem"
import SectionCard from "./dashboard/SectionCard"
import EmptyState from "./dashboard/EmptyState"

type Props = {
  tanks: Tank[]
  fishes: FishRecord[]
  onOpenTankDetail: (tankId: string) => void
  onOpenFishDetail: (fishId: string) => void
}

export default function Dashboard({ tanks, fishes, onOpenTankDetail, onOpenFishDetail }: Props) {
  // Shuffle arrays for dynamic layout on each refresh
  const shuffledFishes = [...fishes].sort(() => Math.random() - 0.5)
  const shuffledTanks = [...tanks].sort(() => Math.random() - 0.5)

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

  // Calculate optimal layout based on content
  const isMinimal = tanks.length <= 1 && fishes.length <= 2
  const isMedium = tanks.length <= 3 && fishes.length <= 6
  
  // Dynamic grid configuration
  const gridConfig = isMinimal 
    ? { columns: "repeat(2, 1fr)", rows: "auto", statsSpan: 1, contentSpan: 2 }
    : isMedium
    ? { columns: "repeat(2, 1fr)", rows: "auto auto 1fr", statsSpan: 1, contentSpan: 2 }
    : { columns: "repeat(4, 1fr)", rows: "repeat(3, 1fr)", statsSpan: 1, contentSpan: 2 }

  return (
    <div className="dashboard-grid" style={{
      gridTemplateColumns: gridConfig.columns,
      gridTemplateRows: gridConfig.rows,
      height: isMinimal || isMedium ? "auto" : "calc(100vh - var(--topbar-height) - var(--space-6) * 2)"
    }}>
      {/* Stats Cards - Top Row */}
      <StatCard 
        icon="🐠"
        value={tanks.length} 
        label="Total Tanks" 
        change="+0 this month" 
        changeType="neutral" 
      />

      <StatCard 
        icon="🐟"
        value={totalFish} 
        label="Total Fish" 
        change="+0 this month" 
        changeType="neutral" 
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

      {/* Your Tanks with Stocking Status */}
      <SectionCard
        title="Your Tanks"
        subtitle="Click any tank to view details · Bioload status shown"
        gridColumn="span 2"
        gridRow={isMinimal ? "auto" : "span 2"}
      >
        {shuffledTanks.length === 0 ? (
          <EmptyState 
            icon="🐠"
            title="No tanks yet"
            description="Add your first tank to get started"
          />
        ) : (
          <div className="grid-auto-fill">
            {shuffledTanks.map(tank => {
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
                    totalBioload: bioload * f.count
                  }
                })

                const totalBioload = fishBioloads.reduce((sum, f) => sum + f.totalBioload, 0)
                const capacity = Math.max(tankVolume, 1)
                const ratio = totalBioload / capacity
                const status = ratio < 0.7 ? "success" : ratio < 0.9 ? "warning" : "error"
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
                    status={status}
                    colors={colors}
                    onClick={() => onOpenTankDetail(tank.id)}
                  />
                )
              }
              
              // If tank has no fish, show simple tank card
              const fishCount = 0
              return (
                <TankCard
                  key={tank.id}
                  name={tank.name}
                  label={tank.label}
                  volume={tankVolume}
                  fishCount={fishCount}
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
        subtitle={`${shuffledFishes.length} entries across all tanks`}
        gridColumn="span 2"
        gridRow={isMinimal ? "auto" : "span 2"}
      >
        {shuffledFishes.length === 0 ? (
          <EmptyState 
            icon="🐟"
            title="No fish yet"
            description="Add fish to your tanks"
          />
        ) : (
          <div className="grid-auto-fill">
            {shuffledFishes.map(fish => {
              const tankName = shuffledTanks.find(t => t.id === fish.tankId)?.name ?? "Unknown"
              return (
                <FishListItem
                  key={fish.id}
                  name={fish.name}
                  count={fish.count}
                  tankName={tankName}
                  imageUrl={fish.imageUrl}
                  onClick={() => onOpenFishDetail(fish.id)}
                />
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
