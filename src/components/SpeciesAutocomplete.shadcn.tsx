import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
  const wrapperRef = useRef<HTMLDivElement>(null)

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
        setOpen(results.length > 0)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function selectSuggestion(suggestion: Suggestion) {
    onChange(suggestion.name, suggestion)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search for fish species..."}
        disabled={disabled}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className={cn(
                  "w-full rounded-sm px-3 py-2 text-left text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                )}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
