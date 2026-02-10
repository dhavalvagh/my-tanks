export type FishEntry = {
  name: string
  count: number
  maxSizeCm?: number | null
  bioload?: number | null
}

function bioloadFor(f: FishEntry) {
  const size = Number(f.maxSizeCm ?? 5)
  const bioload = Number(f.bioload ?? Math.max(0.3, (size / 5) * 0.5))

  return {
    bioload,
    warning: undefined,
    minSchool: undefined,
    minTankLiters: undefined
  }
}

export function calculateStocking(tankLiters: number, fishes: FishEntry[]) {
  let load = 0
  const warnings: string[] = []

  fishes.forEach(f => {
    const { bioload, warning, minSchool, minTankLiters } = bioloadFor(f)
    load += bioload * f.count

    if (warning) warnings.push(`${f.name}: ${warning}`)
    if (minSchool && f.count < minSchool) {
      warnings.push(`${f.name}: school size low (have ${f.count}, want ${minSchool}+)`)
    }
    if (minTankLiters && tankLiters < minTankLiters) {
      warnings.push(`${f.name}: tank under ${minTankLiters} L minimum`)
    }
  })

  const capacity = Math.max(tankLiters, 1)
  const ratio = load / capacity

  return {
    load,
    capacity,
    ratio,
    status:
      ratio < 0.7 ? "safe" :
      ratio < 0.9 ? "caution" :
      "overstocked",
    warnings
  }
}

export function litersFromDimensions(
  lengthCm?: number,
  widthCm?: number,
  heightCm?: number,
  opts?: { headspaceCm?: number; substrateDepthCm?: number; glassThicknessCm?: number }
) {
  if (!lengthCm || !widthCm || !heightCm) return 0
  const headspace = Math.max(0, opts?.headspaceCm ?? 0)
  const substrate = Math.max(0, opts?.substrateDepthCm ?? 0)
  const glass = Math.max(0, opts?.glassThicknessCm ?? 0)

  const innerLength = Math.max(0, lengthCm - 2 * glass)
  const innerWidth = Math.max(0, widthCm - 2 * glass)
  const innerHeight = Math.max(0, heightCm - headspace - substrate - glass)

  return Math.round((innerLength * innerWidth * innerHeight) / 1000)
}

export function recommendedFlow(liters: number) {
  const planted = {
    min: Math.round(liters * 3),
    max: Math.round(liters * 5)
  }
  const fishOnly = {
    min: Math.round(liters * 5),
    max: Math.round(liters * 8)
  }
  return { planted, fishOnly }
}
