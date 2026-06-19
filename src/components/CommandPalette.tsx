import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
    Drop,
    FishSimple,
    MagnifyingGlass,
    Notebook,
    SquaresFour,
} from "phosphor-react";
import { useEffect, useState } from "react";
import type { FishRecord } from "./FishManager.shadcn";
import type { Tank } from "./TankManager.shadcn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tanks: Tank[];
  fishes: FishRecord[];
  onNavigate: (view: "dashboard" | "tanks" | "fish" | "logs") => void;
  onOpenTankDetail: (tankId: string) => void;
  onOpenFishDetail: (fishId: string) => void;
};

export default function CommandPalette({
  open,
  onOpenChange,
  tanks,
  fishes,
  onNavigate,
  onOpenTankDetail,
  onOpenFishDetail,
}: Props) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  function runAction(fn: () => void) {
    fn();
    onOpenChange(false);
    setSearch("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2"
          >
            <Command
              className="overflow-hidden rounded-2xl border bg-popover shadow-2xl shadow-black/20"
              loop
            >
              <div className="flex items-center gap-2 border-b px-4">
                <MagnifyingGlass className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search tanks, fish, or type a command..."
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Command.List className="max-h-[320px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                {/* Navigation */}
                <Command.Group
                  heading="Navigation"
                  className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  <Command.Item
                    onSelect={() => runAction(() => onNavigate("dashboard"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                  >
                    <SquaresFour className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runAction(() => onNavigate("tanks"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                  >
                    <Drop className="h-4 w-4 text-muted-foreground" />
                    Tanks
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runAction(() => onNavigate("fish"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                  >
                    <FishSimple className="h-4 w-4 text-muted-foreground" />
                    Fish
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runAction(() => onNavigate("logs"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                  >
                    <Notebook className="h-4 w-4 text-muted-foreground" />
                    Logs & Reminders
                  </Command.Item>
                </Command.Group>

                {/* Tanks */}
                {tanks.length > 0 && (
                  <Command.Group
                    heading="Tanks"
                    className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {tanks.map((t) => (
                      <Command.Item
                        key={t.id}
                        value={`tank ${t.name}`}
                        onSelect={() => runAction(() => onOpenTankDetail(t.id))}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                      >
                        <Drop className="h-4 w-4 text-primary" />
                        <span>{t.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {t.volumeLiters}L
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Fish */}
                {fishes.length > 0 && (
                  <Command.Group
                    heading="Fish"
                    className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {fishes.map((f) => (
                      <Command.Item
                        key={f.id}
                        value={`fish ${f.name}`}
                        onSelect={() => runAction(() => onOpenFishDetail(f.id))}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted"
                      >
                        <FishSimple className="h-4 w-4 text-secondary" />
                        <span>{f.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          ×{f.count}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
