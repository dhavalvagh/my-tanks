import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function deriveEmail(username: string) {
  const u = username.trim()
  if (!u) return ""
  return `${u}@users.example.com`
}

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [status, setStatus] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user
      if (user) setUserId(user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      setUserId(user?.id ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  async function handleAuth(username: string, password: string, mode: "login" | "signup") {
    const uname = username.trim()
    const pwd = password.trim()
    if (!uname || !pwd) {
      setStatus("Add a username and password")
      return
    }

    try {
      const email = deriveEmail(uname)
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: {
            emailRedirectTo: undefined,
            data: { username: uname, email }
          }
        })
        if (error) throw error
        setStatus("Account created. Email confirmation is not required.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd })
        if (error) throw error
        setStatus("Welcome back")
      }
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { userId, status, handleAuth, signOut }
}
