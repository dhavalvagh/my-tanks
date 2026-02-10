import type { ReactNode } from "react"
import {
  List,
  SquaresFour,
  Drop,
  FishSimple,
  Notebook,
  SignOut,
  SunDim,
  Moon,
  Monitor
} from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useThemeMode } from "@/hooks/useThemeMode"

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

const DRAWER_WIDTH = 240
const RIGHT_DRAWER_WIDTH = 500

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
  const { themeMode, toggleTheme } = useThemeMode()

  const navViews = [
    { id: "dashboard", label: "Dashboard", icon: SquaresFour },
    { id: "tanks", label: "Tanks", icon: Drop },
    { id: "fish", label: "Fish", icon: FishSimple },
    { id: "logs", label: "Logs", icon: Notebook }
  ] as const

  const getViewTitle = () => {
    switch (activeView) {
      case "dashboard": return "Dashboard"
      case "tanks": return "Tanks"
      case "fish": return "Fish"
      case "logs": return "Logs & Reminders"
      case "tank-detail": return "Tank Details"
      case "fish-detail": return "Fish Details"
      default: return "My Tanks"
    }
  }

  const getThemeIcon = () => {
    if (themeMode === 'light') return SunDim
    if (themeMode === 'dark') return Moon
    return Monitor
  }

  const ThemeIcon = getThemeIcon()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="absolute -top-10 left-0 z-[9999] bg-primary px-4 py-2 text-primary-foreground focus:top-0"
      >
        Skip to main content
      </a>

      {/* App Bar */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="mr-2"
          >
            <List className="h-5 w-5" weight="regular" />
          </Button>

          <h1 className="flex-1 text-2xl font-semibold">{getViewTitle()}</h1>

          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-medium">
              {totalFish} fish
            </Badge>
            <Badge variant="default" className="font-medium">
              {totalTanks} tanks
            </Badge>
            {saving && (
              <Badge variant="info" className="font-medium">
                💾 Saving...
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Current theme: ${themeMode}. Click to cycle through light, dark, and system modes.`}
              title={`Theme: ${themeMode}`}
              className="ml-2"
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Navigation */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 border-r bg-background transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: DRAWER_WIDTH }}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground shadow-sm">
                MT
              </div>
              <div>
                <h2 className="mb-1 text-xl font-bold">My Tanks</h2>
                <p className="text-xs text-muted-foreground">Aquarium Management</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pt-4">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Main Navigation
            </p>
            <div className="space-y-1">
              {navViews.map(v => {
                const Icon = v.icon
                return (
                  <Button
                    key={v.id}
                    variant={activeView === v.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onNavigate(v.id as "dashboard" | "tanks" | "fish" | "logs")}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {v.label}
                  </Button>
                )
              })}
            </div>

            {/* Your Tanks */}
            {tanks.length > 0 && (
              <>
                <div className="my-4 h-px bg-border" />
                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Tanks
                </p>
                <div className="space-y-1">
                  {tanks.map(t => (
                    <Button
                      key={t.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onOpenTankDetail(t.id)}
                    >
                      {t.name}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* User Info & Sign Out */}
          <div className="border-t p-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Signed in as <strong>{username}</strong>
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onSignOut}
            >
              <SignOut className="mr-3 h-5 w-5" weight="regular" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 overflow-auto bg-background pt-16 transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? DRAWER_WIDTH : 0,
          marginRight: rightSidebarContent ? RIGHT_DRAWER_WIDTH : 0
        }}
      >
        <div className="mx-auto max-w-6xl p-8">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Contextual Content */}
      {rightSidebarContent && (
        <aside
          className="fixed right-0 top-16 bottom-0 overflow-y-auto border-l bg-background p-6"
          style={{ width: RIGHT_DRAWER_WIDTH }}
        >
          {rightSidebarContent}
        </aside>
      )}
    </div>
  )
}
