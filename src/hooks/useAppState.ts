import { useEffect, useRef, useState } from "react"
import { supabase } from "../services/supabase"
import { requestPermission } from "../services/notifications"
import type { Tank } from "../components/TankManager.shadcn"
import type { FishRecord } from "../components/FishManager.shadcn"

type WaterChange = {
  id: string
  tankId: string
  volumeLiters: number
  changedAt: number
}

type Feeding = {
  id: string
  tankId: string
  food: string
  fedAt: number
  notes?: string
}

type Reminder = {
  id: string
  title: string
  tankId?: string
  type: "water-change" | "feeding"
  everyHours: number
  nextDue: number
  enabled: boolean
}

export type AppState = {
  profile: {
    username: string
    email?: string | null
  }
  tanks: Tank[]
  fishes: FishRecord[]
  waterChanges: WaterChange[]
  feedings: Feeding[]
  reminders: Reminder[]
}

const LOCAL_KEY = "my-tanks-state"
const LEGACY_LOCAL_KEY = "tank-twins-state"

const defaultState: AppState = {
  profile: { username: "" },
  tanks: [],
  fishes: [],
  waterChanges: [],
  feedings: [],
  reminders: []
}

async function loadStateFromSupabase(userId: string, profileDefaults: { username: string; email?: string | null }) {
  const { data, error } = await supabase.from("app_state").select("state").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    throw error
  }

  if (!data?.state) {
    const initial = { ...defaultState, profile: profileDefaults }
    await supabase.from("app_state").upsert({ user_id: userId, state: initial })
    return initial
  }

  return { ...defaultState, ...(data.state as AppState), profile: (data.state as AppState)?.profile ?? profileDefaults }
}

export function useAppState(userId: string | null, username: string) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      const legacyRaw = raw ?? localStorage.getItem(LEGACY_LOCAL_KEY)
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw) as AppState
        // migrate legacy key forward
        localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed))
        return { ...defaultState, ...parsed }
      }
    } catch (err) {
      console.warn("Failed to read local state", err)
    }
    return defaultState
  })
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const prevUserIdRef = useRef<string | null>(userId)

  // Load from Supabase when user logs in
  useEffect(() => {
    const prevUserId = prevUserIdRef.current
    prevUserIdRef.current = userId

    // Handle logout - user was logged in, now logged out
    if (prevUserId && !userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(false)
      setState(defaultState)
      return
    }

    // Not logged in - nothing to do
    if (!userId) {
      return
    }

    // At this point, userId is guaranteed to be a non-null string
    const userIdValue = userId

    let active = true

    async function hydrate() {
      try {
        setError("Loading your tanks…")
        const nextState = await loadStateFromSupabase(userIdValue, { username, email: null })
        if (active) {
          setState(nextState)
          setHydrated(true)
          setError("")
          requestPermission()
        }
      } catch (err) {
        console.error(err)
        if (active) {
          setError("Could not load data. Check Supabase table app_state.")
        }
      }
    }

    hydrate()

    return () => {
      active = false
    }
  }, [userId, username])

  // Debounced save to Supabase
  useEffect(() => {
    if (!userId || !hydrated) return
    const handle = setTimeout(async () => {
      setSaving(true)
      await supabase.from("app_state").upsert({
        user_id: userId,
        state: { ...state, updatedAt: Date.now() }
      })
      setSaving(false)
    }, 450)
    return () => clearTimeout(handle)
  }, [state, userId, hydrated])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
    } catch (err) {
      console.warn("Failed to write local state", err)
    }
  }, [state])

  return { state, setState, hydrated, saving, error }
}
