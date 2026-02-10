import { useState } from "react"

type Props = {
  onAuth: (username: string, password: string, mode: "login" | "signup") => Promise<void>
  status: string
}

export default function AuthForm({ onAuth, status }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [cred, setCred] = useState({ username: "", password: "" })

  async function handleSubmit() {
    await onAuth(cred.username, cred.password, mode)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Tank Twins</p>
          <h1>Freshwater Management</h1>
          <p className="muted">Track tanks, fish, water changes, and feeding schedules</p>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button>
        </div>

        <div className="auth-form">
          <label>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", color: "var(--text-primary)", marginBottom: "var(--space-2)", display: "block" }}>Username</span>
            <input 
              value={cred.username} 
              onChange={(e) => setCred({ ...cred, username: e.target.value })} 
              placeholder="no email needed" 
            />
          </label>
          <label>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", color: "var(--text-primary)", marginBottom: "var(--space-2)", display: "block" }}>Password</span>
            <input 
              type="password" 
              value={cred.password} 
              onChange={(e) => setCred({ ...cred, password: e.target.value })} 
            />
          </label>
          <button className="primary" onClick={handleSubmit}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </div>

        {status && (
          <div style={{ 
            marginTop: "var(--space-4)", 
            padding: "var(--space-3)", 
            background: "var(--surface-2)", 
            borderRadius: "var(--radius-md)", 
            fontSize: "var(--text-sm)", 
            color: "var(--text-secondary)" 
          }}>
            {status}
          </div>
        )}

        <ul style={{ 
          listStyle: "none", 
          padding: 0, 
          margin: "var(--space-6) 0 0", 
          fontSize: "var(--text-sm)", 
          color: "var(--text-tertiary)", 
          lineHeight: "var(--leading-relaxed)" 
        }}>
          <li style={{ marginBottom: "var(--space-2)" }}>✓ Username-based auth with Supabase sync</li>
          <li style={{ marginBottom: "var(--space-2)" }}>✓ Species autocomplete with curated list</li>
          <li>✓ Upload photos or paste image URLs</li>
        </ul>
      </div>
    </div>
  )
}
