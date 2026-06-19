import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { litersFromDimensions } from "../services/stocking";
import type { FishRecord } from "./FishManager.shadcn";
import StockingCard from "./StockingCard.shadcn";
import type { Tank } from "./TankManager.shadcn";

type Props = {
  tanks: Tank[];
  fishes: FishRecord[];
  onOpenTankDetail: (tankId: string) => void;
  onOpenFishDetail: (fishId: string) => void;
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function Dashboard({
  tanks,
  fishes,
  onOpenTankDetail,
  onOpenFishDetail,
}: Props) {
  const orderedFishes = [...fishes].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const orderedTanks = [...tanks].sort((a, b) => a.name.localeCompare(b.name));

  const totalFish = fishes.reduce((sum, f) => sum + f.count, 0);
  const totalVolume = tanks.reduce((sum, t) => {
    const vol =
      t.volumeLiters ||
      litersFromDimensions(t.lengthCm, t.widthCm, t.heightCm, {
        headspaceCm: t.headspaceCm,
        substrateDepthCm: t.substrateDepthCm,
        glassThicknessCm: t.glassThicknessCm,
      });
    return sum + (vol || 0);
  }, 0);
  const uniqueSpecies = new Set(fishes.map((f) => f.name)).size;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Bento Grid - Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <BentoStat icon="🐠" value={tanks.length} label="Tanks" />
        <BentoStat icon="🐟" value={totalFish} label="Total Fish" />
        <BentoStat icon="🌿" value={uniqueSpecies} label="Species" />
        <BentoStat icon="💧" value={`${totalVolume}L`} label="Volume" />
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Tanks - takes 3 columns */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <SectionCard title="Your Tanks" subtitle="Bioload status at a glance">
            {orderedTanks.length === 0 ? (
              <EmptyState
                icon="🐠"
                title="No tanks yet"
                description="Add your first tank to get started tracking"
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {orderedTanks.map((tank) => {
                  const tankVolume =
                    tank.volumeLiters ||
                    litersFromDimensions(
                      tank.lengthCm,
                      tank.widthCm,
                      tank.heightCm,
                      {
                        headspaceCm: tank.headspaceCm,
                        substrateDepthCm: tank.substrateDepthCm,
                        glassThicknessCm: tank.glassThicknessCm,
                      },
                    );
                  const fishInTank = fishes.filter((f) => f.tankId === tank.id);

                  if (fishInTank.length > 0) {
                    const fishBioloads = fishInTank.map((f) => {
                      const size = Number(f.maxSizeCm ?? 5);
                      const bioload = Number(
                        f.bioload ?? Math.max(0.3, (size / 5) * 0.5),
                      );
                      return {
                        name: f.name,
                        count: f.count,
                        bioloadPerFish: bioload,
                        totalBioload: bioload * f.count,
                        imageUrl: f.imageUrl,
                      };
                    });
                    const totalBioload = fishBioloads.reduce(
                      (sum, f) => sum + f.totalBioload,
                      0,
                    );
                    const capacity = Math.max(tankVolume, 1);
                    const ratio = totalBioload / capacity;
                    const colors = [
                      "#1e88e5",
                      "#26a69a",
                      "#66bb6a",
                      "#ffa726",
                      "#ef5350",
                      "#29b6f6",
                      "#ab47bc",
                      "#ec407a",
                    ];

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
                    );
                  }

                  return (
                    <TankCard
                      key={tank.id}
                      name={tank.name}
                      label={tank.label}
                      volumeLiters={tankVolume}
                      onClick={() => onOpenTankDetail(tank.id)}
                    />
                  );
                })}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Fish Roster - takes 2 columns */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <SectionCard
            title="Fish Roster"
            subtitle={`${orderedFishes.length} entries`}
          >
            {orderedFishes.length === 0 ? (
              <EmptyState
                icon="🐟"
                title="No fish yet"
                description="Add fish to your tanks"
              />
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {orderedFishes.map((f) => {
                  const fishTank = tanks.find((t) => t.id === f.tankId);
                  return (
                    <FishListItem
                      key={f.id}
                      name={f.name}
                      count={f.count}
                      tankName={fishTank?.name ?? "Unknown"}
                      imageUrl={f.imageUrl}
                      onClick={() => onOpenFishDetail(f.id)}
                    />
                  );
                })}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------- Sub-components ---------- */

function BentoStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-glow-sm hover:-translate-y-0.5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="text-2xl">{icon}</div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
        {/* Subtle gradient accent */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/40 to-secondary/40 opacity-0 transition-opacity group-hover:opacity-100" />
      </Card>
    </motion.div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TankCard({
  name,
  label,
  volumeLiters,
  onClick,
}: {
  name: string;
  label: string;
  volumeLiters: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border bg-card p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="outline" className="mb-2 text-[10px]">
            {label}
          </Badge>
          <h4 className="font-semibold">{name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{volumeLiters}L</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
          💧
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        No fish yet · Click to add
      </p>
    </button>
  );
}

function FishListItem({
  name,
  count,
  tankName,
  imageUrl,
  onClick,
}: {
  name: string;
  count: number;
  tankName: string;
  imageUrl?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm">
          🐠
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{tankName}</p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        ×{count}
      </Badge>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {icon && <div className="mb-3 text-4xl opacity-40">{icon}</div>}
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
