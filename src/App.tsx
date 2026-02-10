import { useEffect, useState } from "react"
import "./index.css"
import "./App.css"
import { supabase } from "./services/supabase"
import { useAuth } from "./hooks/useAuth"
import { useAppState } from "./hooks/useAppState"
import { useNavigation } from "./hooks/useNavigation"
import { useReminders } from "./hooks/useReminders"
import AuthForm from "./components/AuthForm"
import AppLayout from "./components/AppLayout"
import Dashboard from "./components/Dashboard"
import TankDetail from "./components/TankDetail"
import FishDetail from "./components/FishDetail"
import LogsManager from "./components/LogsManager"
import TankManager from "./components/TankManager"
import FishManager from "./components/FishManager"
import type { Tank } from "./components/TankManager"
import type { FishRecord } from "./components/FishManager"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingFishId, setEditingFishId] = useState<string | null>(null)
  const { userId, status, handleAuth, signOut } = useAuth()
  const { state, setState, hydrated, saving, error } = useAppState(userId, "")
  const { activeView, selectedTankId, selectedFishId, setActiveView, setSelectedTankId, setSelectedFishId } = useNavigation()

  const tankName = (id: string) => state.tanks.find(t => t.id === id)?.name ?? "Unknown tank"

  useReminders(state.reminders, hydrated, tankName, (reminders) => {
    setState(prev => ({ ...prev, reminders }))
  })

  function handleSaveTank(tank: Tank) {
    setState(prev => {
      const existingIndex = prev.tanks.findIndex(t => t.id === tank.id)
      const tanks = existingIndex >= 0
        ? prev.tanks.map(t => t.id === tank.id ? tank : t)
        : [...prev.tanks, tank]
      return { ...prev, tanks }
    })
  }

  function handleDeleteTank(tankId: string) {
    setState(prev => {
      const tanks = prev.tanks.filter(t => t.id !== tankId)
      const nextSelected = selectedTankId === tankId ? (tanks[0]?.id ?? null) : selectedTankId
      if (selectedTankId !== nextSelected) setSelectedTankId(nextSelected)
      return {
        ...prev,
        tanks,
        fishes: prev.fishes.filter(f => f.tankId !== tankId),
        waterChanges: prev.waterChanges.filter(w => w.tankId !== tankId),
        feedings: prev.feedings.filter(f => f.tankId !== tankId),
        reminders: prev.reminders.filter(r => r.tankId !== tankId)
      }
    })
  }

  function handleSaveFish(fish: FishRecord) {
    setState(prev => {
      const existingIndex = prev.fishes.findIndex(f => f.id === fish.id)
      const fishes = existingIndex >= 0
        ? prev.fishes.map(f => f.id === fish.id ? fish : f)
        : [...prev.fishes, fish]
      return { ...prev, fishes }
    })
    setEditingFishId(null)
  }

  function handleDeleteFish(fishId: string) {
    setState(prev => ({
      ...prev,
      fishes: prev.fishes.filter(f => f.id !== fishId)
    }))
  }

  async function handleUploadImage(file: File): Promise<string | undefined> {
    if (!userId) {
      console.error("No user ID - cannot upload")
      return undefined
    }
    
    console.log("Starting upload for:", file.name, "Size:", file.size, "Type:", file.type)
    const path = `users/${userId}/fish/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage.from("fish-photos").upload(path, file, { 
      upsert: true, 
      contentType: file.type 
    })
    
    if (error) {
      console.error("Failed to upload image:", error)
      alert(`Upload failed: ${error.message}`)
      return undefined
    }
    
    console.log("Upload successful:", data)
    const { data: urlData } = supabase.storage.from("fish-photos").getPublicUrl(path)
    console.log("Public URL:", urlData.publicUrl)
    return urlData.publicUrl
  }

  // Auto-select first tank if none selected
  useEffect(() => {
    if (!selectedTankId && state.tanks[0]) {
      setSelectedTankId(state.tanks[0].id)
    }
  }, [selectedTankId, state.tanks, setSelectedTankId])

  function handleNavigate(view: "dashboard" | "tanks" | "fish" | "logs") {
    setActiveView(view)
  }

  function handleOpenTankDetail(tankId: string) {
    setSelectedTankId(tankId)
    setActiveView("tank-detail")
  }

  function handleOpenFishDetail(fishId: string) {
    setSelectedFishId(fishId)
    setActiveView("fish-detail")
  }

  if (!userId) {
    return <AuthForm onAuth={handleAuth} status={status || error} />
  }

  const totalFish = state.fishes.reduce((sum, f) => sum + f.count, 0)
  const selectedTank = selectedTankId ? state.tanks.find(t => t.id === selectedTankId) : null

  return (
    <>
      <AppLayout
        username={state.profile.username}
        totalFish={totalFish}
        totalTanks={state.tanks.length}
        saving={saving}
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        tanks={state.tanks}
        rightSidebarContent={activeView === "tanks" ? (
          <div className="card" style={{ background: "var(--surface-0)" }}>
            <h3 style={{ margin: "0 0 var(--space-3) 0", fontSize: "var(--text-lg)" }}>How volume is calculated</h3>
            <div style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)" }}>
              <p style={{ marginBottom: "var(--space-3)" }}>
                The water volume calculation starts with the tank's outer dimensions and makes adjustments:
              </p>
              
              <div style={{ marginBottom: "var(--space-3)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Base Formula:</strong>
                <div style={{ background: "var(--surface-2)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", marginTop: "var(--space-2)", fontFamily: "monospace" }}>
                  Length × Width × Height ÷ 1000 = Liters
                </div>
              </div>

              <div style={{ marginBottom: "var(--space-3)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Adjustments:</strong>
                <ul style={{ marginTop: "var(--space-2)", paddingLeft: "var(--space-4)", listStyle: "disc" }}>
                  <li style={{ marginBottom: "var(--space-2)" }}>
                    <strong>Headspace:</strong> Reduces height (gap from waterline to rim)
                  </li>
                  <li style={{ marginBottom: "var(--space-2)" }}>
                    <strong>Substrate:</strong> Reduces height (gravel/sand depth)
                  </li>
                  <li style={{ marginBottom: "var(--space-2)" }}>
                    <strong>Glass thickness:</strong> Reduces all dimensions (subtracted from both sides)
                  </li>
                </ul>
              </div>

              <div style={{ background: "var(--info-bg)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--info)" }}>
                <strong style={{ color: "var(--info)" }}>💡 Example:</strong>
                <div style={{ marginTop: "var(--space-2)" }}>
                  30×18×20 cm tank with 2.5 cm headspace, 2 cm substrate, and 0.15 cm glass = <strong>8L</strong>
                </div>
              </div>

              <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "var(--space-3)" }}>Flow Rate Recommendations:</strong>
                <div style={{ marginBottom: "var(--space-3)" }}>
                  <div style={{ fontWeight: "var(--font-semibold)", color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>🌿 Planted Tanks:</div>
                  <div style={{ paddingLeft: "var(--space-4)" }}>3-5× tank volume per hour</div>
                  <div style={{ paddingLeft: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
                    (e.g., 8L tank = 24-40 L/h)
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "var(--font-semibold)", color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>🐠 Fish-Only Tanks:</div>
                  <div style={{ paddingLeft: "var(--space-4)" }}>5-8× tank volume per hour</div>
                  <div style={{ paddingLeft: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
                    (e.g., 8L tank = 40-64 L/h)
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === "fish" ? (
          <div className="card" style={{ background: "var(--surface-0)" }}>
            <h3 style={{ margin: "0 0 var(--space-3) 0", fontSize: "var(--text-lg)" }}>All Fish</h3>
            <div className="mini-list">
              {state.fishes.length === 0 && <p className="muted">No fish yet.</p>}
              {state.fishes.map(f => (
                <div 
                  key={f.id} 
                  className="list-row" 
                  style={{ position: "relative", cursor: "pointer" }}
                  onClick={() => handleOpenFishDetail(f.id)}
                  onMouseEnter={(e) => {
                    const actions = e.currentTarget.querySelector('.hover-actions') as HTMLElement
                    if (actions) actions.style.opacity = "1"
                  }}
                  onMouseLeave={(e) => {
                    const actions = e.currentTarget.querySelector('.hover-actions') as HTMLElement
                    if (actions) actions.style.opacity = "0"
                  }}
                >
                  <div>
                    <strong>{f.name}</strong> <span className="pill subtle">×{f.count}</span>
                    <p className="muted">{tankName(f.tankId)}</p>
                  </div>
                  {f.imageUrl && <img src={f.imageUrl} className="thumb" alt="fish" />}
                  <div 
                    className="hover-actions"
                    style={{ 
                      opacity: 0,
                      transition: "opacity var(--transition-fast)",
                      position: "absolute",
                      right: "var(--space-3)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      gap: "var(--space-1)"
                    }}
                  >
                    <button 
                      className="ghost compact" 
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFishId(f.id)
                        const fishManagerSection = document.querySelector('section.card') as HTMLElement
                        if (fishManagerSection) {
                          fishManagerSection.scrollIntoView({ behavior: 'smooth' })
                        }
                      }} 
                      style={{ fontSize: "var(--text-sm)", padding: "var(--space-1) var(--space-2)" }}
                    >
                      ✎
                    </button>
                    <button 
                      className="ghost compact" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFish(f.id) }} 
                      style={{ fontSize: "var(--text-sm)", padding: "var(--space-1) var(--space-2)" }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : undefined}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        onNavigate={handleNavigate}
        onOpenTankDetail={handleOpenTankDetail}
        onSignOut={signOut}
      >
        {(() => {
          if (activeView === "fish-detail") {
            const selectedFish = selectedFishId ? state.fishes.find(f => f.id === selectedFishId) : null
            if (!selectedFish) {
              return <section className="card"><p className="muted">Fish not found.</p></section>
            }
            const fishTank = state.tanks.find(t => t.id === selectedFish.tankId)
            if (!fishTank) {
              return <section className="card"><p className="muted">Tank not found for this fish.</p></section>
            }
            return (
              <FishDetail
                fish={selectedFish}
                tank={fishTank}
                onSave={handleSaveFish}
                onDelete={handleDeleteFish}
                onUploadImage={handleUploadImage}
                onNavigateBack={() => setActiveView("dashboard")}
              />
            )
          }

          if (activeView === "tank-detail") {
            if (!selectedTank) {
              return <section className="card"><p className="muted">No tank selected. Add or choose a tank from the menu.</p></section>
            }
            return (
              <TankDetail
                tank={selectedTank}
                fishes={state.fishes}
                onSave={handleSaveTank}
                onNavigateToTanks={() => setActiveView("tanks")}
                onOpenFishDetail={handleOpenFishDetail}
              />
            )
          }

          if (activeView === "tanks") {
            return <TankManager tanks={state.tanks} onSave={handleSaveTank} onDelete={handleDeleteTank} onOpenDetail={handleOpenTankDetail} />
          }

          if (activeView === "fish") {
            return <FishManager tanks={state.tanks} fishes={state.fishes} editFishId={editingFishId} userId={userId} onSave={handleSaveFish} onDelete={handleDeleteFish} onUploadImage={handleUploadImage} tankNameLookup={tankName} />
          }

          if (activeView === "logs") {
            return (
              <LogsManager
                tanks={state.tanks}
                waterChanges={state.waterChanges}
                feedings={state.feedings}
                reminders={state.reminders}
                onLogWaterChange={(tankId: string, volumeLiters: number) =>
                  setState(prev => ({
                    ...prev,
                    waterChanges: [...prev.waterChanges, { id: crypto.randomUUID(), tankId, volumeLiters, changedAt: Date.now() }]
                  }))
                }
                onLogFeeding={(tankId: string, food: string) =>
                  setState(prev => ({
                    ...prev,
                    feedings: [...prev.feedings, { id: crypto.randomUUID(), tankId, food, fedAt: Date.now() }]
                  }))
                }
                onCreateReminder={(r: Omit<{ id: string; title: string; tankId?: string; type: "water-change" | "feeding"; everyHours: number; nextDue: number; enabled: boolean }, "id" | "nextDue" | "enabled">) =>
                  setState(prev => ({
                    ...prev,
                    reminders: [...prev.reminders, { ...r, id: crypto.randomUUID(), nextDue: Date.now() + r.everyHours * 60 * 60 * 1000, enabled: true }]
                  }))
                }
                onToggleReminder={(id: string, enabled: boolean) =>
                  setState(prev => ({
                    ...prev,
                    reminders: prev.reminders.map(r => (r.id === id ? { ...r, enabled } : r))
                  }))
                }
                onDeleteReminder={(id: string) =>
                  setState(prev => ({
                    ...prev,
                    reminders: prev.reminders.filter(r => r.id !== id)
                  }))
                }
              />
            )
          }

          return <Dashboard tanks={state.tanks} fishes={state.fishes} onOpenTankDetail={handleOpenTankDetail} onOpenFishDetail={handleOpenFishDetail} />
        })()}
      </AppLayout>

      {(status || error) && <div className="toast">{status || error}</div>}
    </>
  )
}

export default App
