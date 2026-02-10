import { useState } from "react"

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
	const [draft, setDraft] = useState<{ title: string; tankId: string; type: "water-change" | "feeding"; everyHours: number }>({
		title: "Water change",
		tankId: "",
		type: "water-change",
		everyHours: 7 * 24
	})

	function add() {
		if (!draft.title) return
		onCreate({ ...draft, tankId: draft.tankId || undefined })
		setDraft({ ...draft, title: "Water change" })
	}

	return (
		<div className="panel">
			<div className="form-grid">
				<label>
					<span>Title</span>
					<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
				</label>
				<label>
					<span>Type</span>
					<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as "water-change" | "feeding" })}>
						<option value="water-change">Water change</option>
						<option value="feeding">Feeding</option>
					</select>
				</label>
				<label>
					<span>Every (days)</span>
					<input type="number" value={Math.round(draft.everyHours / 24)} onChange={(e) => setDraft({ ...draft, everyHours: Number(e.target.value) * 24 })} />
				</label>
				<label>
					<span>Tank (optional)</span>
					<select value={draft.tankId} onChange={(e) => setDraft({ ...draft, tankId: e.target.value })}>
						<option value="">Any tank</option>
						{tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
					</select>
				</label>
			</div>
			<button className="ghost" onClick={add}>Add reminder</button>

			<div className="mini-list" style={{ marginTop: "0.75rem" }}>
				{reminders.length === 0 && <p className="muted">No reminders yet.</p>}
				{reminders.map(r => (
					<div key={r.id} className="list-row">
						<div>
							<strong>{r.title}</strong> <span className="pill subtle">{r.type}</span>
							<p className="muted">Every {Math.round(r.everyHours / 24)} days {r.tankId ? `· ${tanks.find(t => t.id === r.tankId)?.name ?? ""}` : ""}</p>
						</div>
						<div className="row-actions">
							<label className="toggle">
								<input type="checkbox" checked={r.enabled} onChange={(e) => onToggle(r.id, e.target.checked)} />
								<span>{r.enabled ? "On" : "Off"}</span>
							</label>
							<button className="ghost" onClick={() => onDelete(r.id)}>Remove</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
