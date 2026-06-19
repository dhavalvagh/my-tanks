import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useThemeMode } from "@/hooks/useThemeMode";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    Drop,
    FishSimple,
    List,
    MagnifyingGlass,
    Monitor,
    Moon,
    Notebook,
    SignOut,
    SquaresFour,
    SunDim,
} from "phosphor-react";
import type { ReactNode } from "react";

type Props = {
  username: string;
  totalFish: number;
  totalTanks: number;
  saving: boolean;
  sidebarOpen: boolean;
  activeView: string;
  tanks: Array<{ id: string; name: string }>;
  rightSidebarContent?: ReactNode;
  onToggleSidebar: () => void;
  onNavigate: (view: "dashboard" | "tanks" | "fish" | "logs") => void;
  onOpenTankDetail: (tankId: string) => void;
  onOpenCommandPalette?: () => void;
  onSignOut: () => void;
  children: ReactNode;
};

const DRAWER_WIDTH = 260;
const RIGHT_DRAWER_WIDTH = 420;

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
  onOpenCommandPalette,
  onSignOut,
  children,
}: Props) {
  const { themeMode, toggleTheme } = useThemeMode();

  const navViews = [
    { id: "dashboard", label: "Dashboard", icon: SquaresFour },
    { id: "tanks", label: "Tanks", icon: Drop },
    { id: "fish", label: "Fish", icon: FishSimple },
    { id: "logs", label: "Logs", icon: Notebook },
  ] as const;

  const getThemeIcon = () => {
    if (themeMode === "light") return SunDim;
    if (themeMode === "dark") return Moon;
    return Monitor;
  };

  const ThemeIcon = getThemeIcon();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Skip link */}
      <a
        href="#main-content"
        className="absolute -top-10 left-0 z-[9999] bg-primary px-4 py-2 text-primary-foreground focus:top-0"
      >
        Skip to main content
      </a>

      {/* Header - Glass morphism */}
      <header className="fixed top-0 right-0 left-0 z-50 glass">
        <div className="flex h-14 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="shrink-0"
          >
            <List className="h-5 w-5" weight="regular" />
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">My Tanks</h1>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Aquarium Management
            </span>
          </div>

          {/* Search trigger */}
          {onOpenCommandPalette && (
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground h-9 px-3 rounded-xl"
              onClick={onOpenCommandPalette}
            >
              <MagnifyingGlass className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-medium text-xs">
              {totalTanks} tank{totalTanks !== 1 && "s"}
            </Badge>
            <Badge variant="default" className="font-medium text-xs">
              {totalFish} fish
            </Badge>
            {saving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="info" className="font-medium text-xs">
                  Saving...
                </Badge>
              </motion.div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Theme: ${themeMode}`}
              title={`Theme: ${themeMode}`}
              className="h-9 w-9"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Glass */}
      <aside
        className={cn(
          "fixed left-0 top-14 bottom-0 z-40 glass-subtle transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ width: DRAWER_WIDTH }}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 pt-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Navigation
            </p>
            <div className="space-y-1">
              {navViews.map((v) => {
                const Icon = v.icon;
                const isActive = activeView === v.id;
                return (
                  <button
                    key={v.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-glow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() =>
                      onNavigate(
                        v.id as "dashboard" | "tanks" | "fish" | "logs",
                      )
                    }
                  >
                    <Icon
                      className="h-5 w-5"
                      weight={isActive ? "fill" : "regular"}
                    />
                    {v.label}
                  </button>
                );
              })}
            </div>

            {/* Tank shortcuts */}
            {tanks.length > 0 && (
              <>
                <div className="my-5 h-px bg-border/50" />
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your Tanks
                </p>
                <div className="space-y-1">
                  {tanks.map((t) => (
                    <button
                      key={t.id}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => onOpenTankDetail(t.id)}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary/60" />
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* User section */}
          <div className="border-t border-border/50 p-4">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">
                {username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onSignOut}
                aria-label="Sign out"
              >
                <SignOut className="h-4 w-4" weight="regular" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 overflow-auto pt-14 transition-all duration-300 ease-out"
        style={{
          marginLeft: sidebarOpen ? DRAWER_WIDTH : 0,
          marginRight: rightSidebarContent ? RIGHT_DRAWER_WIDTH : 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-6xl p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Right Sidebar */}
      <AnimatePresence>
        {rightSidebarContent && (
          <motion.aside
            initial={{ x: RIGHT_DRAWER_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: RIGHT_DRAWER_WIDTH, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-14 bottom-0 overflow-y-auto glass-subtle p-5"
            style={{ width: RIGHT_DRAWER_WIDTH }}
          >
            {rightSidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
