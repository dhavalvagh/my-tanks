import { useEffect, useState, useRef } from "react"

type Suggestion = {
	name: string
	maxSizeCm?: number | null
	bioload?: number | null
}

type Props = {
	value: string
	onChange: (value: string, meta?: Suggestion) => void
	placeholder?: string
	disabled?: boolean
}

export default function SpeciesAutocomplete({ value, onChange, placeholder, disabled }: Props) {
	const [open, setOpen] = useState(false)
	const [suggestions, setSuggestions] = useState<Suggestion[]>([])
	const [loading, setLoading] = useState(false)
	const debounceTimer = useRef<number | null>(null)

	useEffect(() => {
		if (!value || value.length < 2) {
			setSuggestions([])
			return
		}

		// Clear previous timer
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current)
		}

		// Debounce API call
		debounceTimer.current = setTimeout(async () => {
			setLoading(true)
			try {
				const response = await fetch(
					`https://en.wikipedia.org/w/api.php?` +
					new URLSearchParams({
						action: "opensearch",
						search: `${value} fish`,
						limit: "8",
						namespace: "0",
						format: "json",
						origin: "*"
					})
				)

				const data = await response.json()
				const titles = data[1] as string[]

				const results: Suggestion[] = titles
					.slice(0, 6)
					.map((title: string) => {
						// Clean up the title
						const cleanName = title
							.replace(/ \(.*?\)/g, "") // Remove parenthetical info
							.replace(/\s+fish$/i, "") // Remove trailing "fish"
							.trim()

						return {
							name: cleanName,
							maxSizeCm: null,
							bioload: null
						}
					})

				setSuggestions(results)
			} catch (error) {
				console.error("Failed to fetch species:", error)
				setSuggestions([])
			} finally {
				setLoading(false)
			}
		}, 300) // 300ms debounce

		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current)
			}
		}
	}, [value])

	function pick(s: Suggestion) {
		onChange(s.name, s)
		setOpen(false)
	}

	return (
		<div className="autocomplete" onBlur={() => setTimeout(() => setOpen(false), 120)}>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder ?? "Start typing a species (e.g., neon tetra)"}
				onFocus={() => setOpen(true)}
				disabled={disabled}
			/>
			{open && (loading || suggestions.length > 0) && (
				<div className="suggestions">
					{loading && (
						<div style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--text-tertiary)" }}>
							Loading species...
						</div>
					)}
					{!loading && suggestions.length > 0 && suggestions.map((s, idx) => (
						<button key={`${s.name}-${idx}`} type="button" onMouseDown={() => pick(s)}>
							<span>{s.name}</span>
						</button>
					))}
					{!loading && suggestions.length === 0 && value.length >= 2 && (
						<div style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--text-tertiary)" }}>
							No species found. Type to add custom name.
						</div>
					)}
				</div>
			)}
		</div>
	)
}
