import type { ReactNode } from "react"

type Props = {
  username: string
  totalFish: number
  totalTanks: number
  saving: boolean
  sidebarOpen: boolean
  activeView: string
  tanks: Array<{ id: string; name: string }>
  rightSidebarContent?: ReactNode
  onToggleSidebar: () => void
  onNavigate: (view: "dashboard" | "tanks" | "fish" | "logs") => void
  onOpenTankDetail: (tankId: string) => void
  onSignOut: () => void
  children: ReactNode
}

export default function AppLayout({
  username,
  totalFish,
  totalTanks,
  saving,
  sidebarOpen,
  activeView,
  tanks,
  rightSidebarContent,
  onToggleSidebar,
  onNavigate,
  onOpenTankDetail,
  onSignOut,
  children
}: Props) {
  const navViews = [
    { id: "dashboard", label: "🏠 Dashboard" },
    { id: "tanks", label: "🐠 Tanks" },
    { id: "fish", label: "🐟 Fish" },
    { id: "logs", label: "📝 Logs" }
  ] as const

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* LEFT SIDEBAR - NAVIGATION */}
      <aside className={`sidebar-left ${sidebarOpen ? "" : "hidden"}`}>
        <div className="nav-header">
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)" }}>Tank Twins</h2>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
            Aquarium Management
          </p>
        </div>
        
        <nav className="nav-section">
          <p className="nav-section-title">Main Navigation</p>
          {navViews.map(v => (
            <button
              key={v.id}
              className={`nav-link ${activeView === v.id ? "active" : ""}`}
              type="button"
              onClick={() => onNavigate(v.id as "dashboard" | "tanks" | "fish" | "logs")}
              aria-current={activeView === v.id ? "page" : undefined}
            >
              {v.label}
            </button>
          ))}
        </nav>
        
        {tanks.length > 0 && (
          <nav className="nav-section">
            <p className="nav-section-title">Your Tanks</p>
            {tanks.map(t => (
              <button 
                key={t.id} 
                className="nav-link" 
                type="button" 
                onClick={() => onOpenTankDetail(t.id)}
              >
                {t.name}
              </button>
            ))}
          </nav>
        )}
        
        <div style={{ marginTop: "auto", padding: "var(--space-3)", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>
            Signed in as {username}
          </p>
          <button className="text" onClick={onSignOut} style={{ width: "100%", justifyContent: "flex-start" }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button 
              className="icon-button" 
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              ☰
            </button>
            <h1 style={{ fontSize: "var(--text-2xl)", margin: 0 }}>
              {activeView === "dashboard" && "Dashboard"}
              {activeView === "tanks" && "Tanks"}
              {activeView === "fish" && "Fish"}
              {activeView === "logs" && "Logs & Reminders"}
              {activeView === "tank-detail" && "Tank Details"}
              {activeView === "fish-detail" && "Fish Details"}
            </h1>
          </div>
          <div className="topbar-right">
            <span className="pill primary">{totalFish} fish</span>
            <span className="pill primary">{totalTanks} tanks</span>
            {saving && <span className="pill info">💾 Saving...</span>}
          </div>
        </header>

        {/* Content */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR - CONTEXTUAL INFO */}
      {rightSidebarContent && (
        <aside className="sidebar-right">
          {rightSidebarContent}
        </aside>
      )}
    </div>
  )
}
