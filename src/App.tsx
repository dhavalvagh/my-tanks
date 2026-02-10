import { useEffect, useState, lazy, Suspense } from "react"
import { Eye, PencilSimpleLine, Trash } from "phosphor-react"
import "./index.css"
import { supabase } from "./services/supabase"
import { useAuth } from "./hooks/useAuth"
import { useAppState } from "./hooks/useAppState"
import { useNavigation } from "./hooks/useNavigation"
import { useReminders } from "./hooks/useReminders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AuthForm from "./components/AuthForm.shadcn"
import AppLayout from "./components/AppLayout.shadcn"
import type { Tank } from "./components/TankManager.shadcn"
import type { FishRecord } from "./components/FishManager.shadcn"

// Lazy load heavy components
const Dashboard = lazy(() => import("./components/Dashboard.shadcn"))
const TankDetail = lazy(() => import("./components/TankDetail.shadcn"))
const FishDetail = lazy(() => import("./components/FishDetail.shadcn"))
const LogsManager = lazy(() => import("./components/LogsManager.shadcn"))
const TankManager = lazy(() => import("./components/TankManager.shadcn"))
const FishManager = lazy(() => import("./components/FishManager.shadcn"))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

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
          <Card>
            <CardHeader>
              <CardTitle>How volume is calculated</CardTitle>
              <p className="text-sm text-muted-foreground">
                The water volume calculation starts with the tank&apos;s outer dimensions and makes adjustments.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Base formula</p>
                <div className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                  Length × Width × Height ÷ 1000 = Liters
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground">Adjustments</p>
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  <li><strong>Headspace:</strong> reduces height (gap from waterline to rim)</li>
                  <li><strong>Substrate:</strong> reduces height (gravel/sand depth)</li>
                  <li><strong>Glass thickness:</strong> reduces all dimensions (subtracted from both sides)</li>
                </ul>
              </div>

              <div className="rounded-md border-l-4 border-info bg-info/10 px-3 py-3">
                <p className="font-semibold text-info">💡 Example</p>
                <p className="mt-1 text-foreground">
                  30×18×20 cm tank with 2.5 cm headspace, 2 cm substrate, and 0.15 cm glass = <strong>8L</strong>
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold text-foreground mb-3">Flow rate recommendations</p>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-foreground">🌿 Planted tanks</div>
                    <p className="text-sm">3–5× tank volume per hour (e.g., 8L = 24–40 L/h)</p>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">🐠 Fish-only tanks</div>
                    <p className="text-sm">5–8× tank volume per hour (e.g., 8L = 40–64 L/h)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : activeView === "fish" ? (
          <Card>
            <CardHeader>
              <CardTitle>All Fish</CardTitle>
              <p className="text-sm text-muted-foreground">Quick actions for your roster</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.fishes.length === 0 && (
                <p className="text-sm text-muted-foreground">No fish yet.</p>
              )}
              {state.fishes.map(f => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        alt={f.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
                        🐠
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        {f.name}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">×{f.count}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{tankName(f.tankId)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                      onClick={() => handleOpenFishDetail(f.id)}
                      aria-label={`View ${f.name}`}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                      onClick={() => {
                        setEditingFishId(f.id)
                        setActiveView("fish")
                      }}
                      aria-label={`Edit ${f.name}`}
                      title="Edit"
                    >
                      <PencilSimpleLine className="h-4 w-4" />
                    </button>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-md border text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFish(f.id)}
                      aria-label={`Delete ${f.name}`}
                      title="Delete"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : undefined}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        onNavigate={handleNavigate}
        onOpenTankDetail={handleOpenTankDetail}
        onSignOut={signOut}
      >
        <Suspense fallback={<LoadingFallback />}>
          {(() => {
          if (activeView === "fish-detail") {
            const selectedFish = selectedFishId ? state.fishes.find(f => f.id === selectedFishId) : null
            if (!selectedFish) {
              return (
                <Card>
                  <CardContent>
                    <p className="text-muted-foreground">Fish not found.</p>
                  </CardContent>
                </Card>
              )
            }
            const fishTank = state.tanks.find(t => t.id === selectedFish.tankId)
            if (!fishTank) {
              return (
                <Card>
                  <CardContent>
                    <p className="text-muted-foreground">Tank not found for this fish.</p>
                  </CardContent>
                </Card>
              )
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
              return (
                <Card>
                  <CardContent>
                    <p className="text-muted-foreground">No tank selected. Add or choose a tank from the menu.</p>
                  </CardContent>
                </Card>
              )
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
        </Suspense>
      </AppLayout>

      {(status || error) && (
        <div className="fixed bottom-4 right-4 rounded-md bg-secondary px-4 py-2 text-secondary-foreground shadow-lg">
          {status || error}
        </div>
      )}
    </>
  )
}

export default App
