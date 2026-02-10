import { useEffect, useRef, useState } from "react"

const NAV_KEY = "my-tanks-nav"
const LEGACY_NAV_KEY = "tank-twins-nav"

type View = "dashboard" | "tanks" | "fish" | "logs" | "tank-detail" | "fish-detail"

function getInitialNavState() {
  try {
    const raw = localStorage.getItem(NAV_KEY)
    const legacyRaw = raw ?? localStorage.getItem(LEGACY_NAV_KEY)
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as { view?: View; tankId?: string | null; fishId?: string | null }
      // migrate legacy key forward
      localStorage.setItem(NAV_KEY, JSON.stringify(parsed))
      return parsed
    }
  } catch (err) {
    console.warn("Failed to read nav state", err)
  }
  return { view: "dashboard" as View, tankId: null, fishId: null }
}

export function useNavigation() {
  const initialState = getInitialNavState()
  const [activeView, setActiveView] = useState<View>(initialState.view ?? "dashboard")
  const [selectedTankId, setSelectedTankId] = useState<string | null>(initialState.tankId ?? null)
  const [selectedFishId, setSelectedFishId] = useState<string | null>(initialState.fishId ?? null)
  const historyPopRef = useRef(false)

  // Sync with browser history
  useEffect(() => {
    const state = { view: activeView, tankId: selectedTankId, fishId: selectedFishId }
    if (!historyPopRef.current) {
      let hash = `#${activeView}`
      if (selectedTankId) hash += `:${selectedTankId}`
      if (selectedFishId) hash += `:${selectedFishId}`
      window.history.pushState(state, "", `${window.location.pathname}${hash}`)
    } else {
      historyPopRef.current = false
    }
  }, [activeView, selectedTankId, selectedFishId])

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const s = (event.state ?? {}) as { view?: View; tankId?: string | null; fishId?: string | null }
      if (s.view) {
        historyPopRef.current = true
        setActiveView(s.view)
        setSelectedTankId(s.tankId ?? null)
        setSelectedFishId(s.fishId ?? null)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NAV_KEY, JSON.stringify({ view: activeView, tankId: selectedTankId, fishId: selectedFishId }))
    } catch (err) {
      console.warn("Failed to write nav state", err)
    }
  }, [activeView, selectedTankId, selectedFishId])

  return { activeView, selectedTankId, selectedFishId, setActiveView, setSelectedTankId, setSelectedFishId }
}
