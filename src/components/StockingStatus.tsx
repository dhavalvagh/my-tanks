import { calculateStocking, litersFromDimensions } from "../services/stocking"

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

function statusTone(status: string) {
	if (status === "safe") return "success"
	if (status === "caution") return "warning"
	return "error"
}

export default function StockingStatus({ tanks, fishes }: Props) {
	if (tanks.length === 0) return <p style={{ color: "var(--text-tertiary)" }}>Add tanks to see stocking guidance.</p>

	return (
		<div style={{ display: "grid", gap: "var(--space-3)", gridTemplateColumns: "1fr" }}>
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

				return (
					<div key={tank.id} className={`card ${statusTone(result.status)}`} style={{ padding: "var(--space-4)" }}>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
							<div>
								<p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>{tank.name}</p>
								<h4 style={{ margin: "var(--space-1) 0", fontSize: "var(--text-lg)" }}>{tankVolume} L</h4>
							</div>
							<span className={`pill ${statusTone(result.status)}`}>{result.status}</span>
						</div>

						<div className="progress" style={{ marginBottom: "var(--space-2)" }}>
							<div className={`progress-bar ${statusTone(result.status)}`} style={{ width: `${percent}%` }} />
						</div>
						<p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
							Bioload {result.load.toFixed(1)} / {result.capacity.toFixed(1)}
						</p>

						{result.warnings.length > 0 && (
							<ul style={{ listStyle: "none", padding: 0, margin: "var(--space-2) 0 0", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
								{result.warnings.map((w, idx) => <li key={idx}>⚠️ {w}</li>)}
							</ul>
						)}
						{fishInTank.length === 0 && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", fontStyle: "italic" }}>No fish assigned to this tank yet.</p>}
					</div>
				)
			})}
		</div>
	)
}
