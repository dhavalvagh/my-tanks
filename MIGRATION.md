# Shadcn/UI Migration Guide

## Overview
This document tracks the migration from Material UI to Shadcn/UI (Tailwind CSS + Radix UI primitives).

## Migration Progress

### ✅ Phase 1: Infrastructure (Complete)
- [x] Tailwind CSS v4 installed with @tailwindcss/postcss
- [x] PostCSS configured with autoprefixer
- [x] Path aliases configured (@/*)
- [x] Design tokens established in globals.css
- [x] Dark mode system with light/dark/system modes
- [x] Aquarium-specific color palette (ocean blue primary, teal secondary)
- [x] 5-level status system (healthy, info, attention, warning, critical)

### ✅ Phase 2: Core UI Primitives (Complete)
Created Shadcn/UI components:
- [x] Button (8 variants: default, destructive, outline, secondary, ghost, link + sizes)
- [x] Card (with header, title, description, content, footer)
- [x] Input (form input with focus rings)
- [x] Badge (with status variants: healthy/info/attention/warning/critical)
- [x] Dialog (modal with overlay, animations)
- [x] Tabs (tab navigation component)
- [x] Switch (toggle component)
- [x] Label (form label)
- [x] Select (dropdown with search)
- [x] Textarea (multi-line input)
- [x] CN utility (class name merger with tailwind-merge)
- [x] Status system utility (lib/status.ts)

### ✅ Phase 3: Core Layout (Complete)
- [x] AppLayout.shadcn.tsx created (replacement for AppLayout.tsx)
  - Three-column layout with persistent sidebars
  - Theme switcher (light/dark/system)
  - Navigation with Lucide icons
  - Tank list in sidebar
  - User profile & sign out
  - Skip link for accessibility
  - Responsive transitions

### ⏳ Phase 4: Dashboard Components (Not Started)
Migrate dashboard subcomponents:
- [ ] StatCard → use Shadcn Card + Badge
- [ ] TankCard → use Shadcn Card + interactive styles
- [ ] FishListItem → use Shadcn layout utilities
- [ ] SectionCard → use Shadcn Card wrapper
- [ ] EmptyState → use Shadcn typography + icons

### ⏳ Phase 5: Feature Screens (Not Started)
Migrate manager components:
- [ ] TankManager → forms with Shadcn Input, Select, Textarea, Button
- [ ] FishManager → image upload, species autocomplete
- [ ] LogsManager → inline forms, date/time inputs
- [ ] TankDetail → stocking analysis display
- [ ] FishDetail → fish detail view
- [ ] Dashboard → grid layout with all cards

### ⏳ Phase 6: Cleanup (Not Started)
- [ ] Remove Material UI imports from all components
- [ ] Delete old MUI theme files
- [ ] Uninstall @mui/* packages
- [ ] Remove MUI chunk configuration from vite.config.ts
- [ ] Verify bundle size reduction

### ⏳ Phase 7: Audit (Not Started)
- [ ] WCAG 2.2 AA accessibility check
- [ ] Dark mode verification across all components
- [ ] Performance metrics (bundle size, FCP, LCP)
- [ ] Cross-browser testing

## Design System Reference

### Color Palette
```css
/* Primary - Ocean Blue */
--primary: 199 89% 48%  /* #2E8BC0 */

/* Secondary - Teal */
--secondary: 165 30% 50%  /* #6FB1A0 */

/* Status Colors */
--healthy: 142 76% 36%    /* #16A34A - green */
--info: 221 83% 53%       /* #3B82F6 - blue */
--attention: 48 96% 53%   /* #F59E0B - amber */
--warning: 25 95% 53%     /* #F97316 - orange */
--critical: 0 84% 60%     /* #EF4444 - red */
```

### Typography
- Headings: font-semibold to font-bold
- Body: text-sm (14px) or text-base (16px)
- Captions: text-xs (12px) with text-muted-foreground

### Spacing
- Component padding: p-4 to p-6 (16px to 24px)
- Card padding: p-6 (24px)
- Gap between elements: gap-2 to gap-4 (8px to 16px)

### Component Patterns

#### Card Pattern
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Form Pattern
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Label</Label>
    <Input id="field" placeholder="Enter value" />
  </div>
  <Button>Submit</Button>
</div>
```

#### Status Badge
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="healthy">Healthy</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="critical">Critical</Badge>
```

## Migration Steps for Each Component

### Step 1: Create .shadcn.tsx version
- Copy original component to `ComponentName.shadcn.tsx`
- Keep original intact for comparison

### Step 2: Replace imports
```tsx
// Before (MUI)
import { Box, Card, Button } from "@mui/material"

// After (Shadcn)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Step 3: Replace JSX
```tsx
// Before (MUI)
<Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
  <Typography variant="h6">Title</Typography>
</Box>

// After (Shadcn)
<div className="p-4 bg-background">
  <h3 className="text-lg font-semibold">Title</h3>
</div>
```

### Step 4: Test functionality
- Verify all interactions work
- Test dark mode
- Check accessibility

### Step 5: Swap in App.tsx
```tsx
// Change import
import AppLayout from "./components/AppLayout.shadcn"

// Later, rename AppLayout.shadcn.tsx → AppLayout.tsx
```

## Icon Migration

### MUI Icons → Lucide React
```tsx
// Before
import { Dashboard, Opacity, Pets } from "@mui/icons-material"

// After
import { LayoutDashboard, Droplet, Fish } from "lucide-react"
```

Common mappings:
- Dashboard → LayoutDashboard
- Opacity → Droplet
- Pets → Fish
- Description → FileText
- Logout → LogOut
- LightMode → Sun
- DarkMode → Moon
- SettingsBrightness → MonitorSmartphone
- Menu → Menu

## Theme Mode Migration

### Before (MUI ThemeProvider)
```tsx
import { useTheme } from "@mui/material"
const theme = useTheme()
```

### After (Tailwind dark mode)
```tsx
// Toggle dark mode
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}

// Check current mode
const isDark = document.documentElement.classList.contains('dark')
```

## Bundle Size Targets

### Current (with MUI)
- Total: 740 KB
- MUI Core: 315 KB (96.71 KB gzipped)
- Main: 378 KB (110.61 KB gzipped)

### Target (Shadcn only)
- Estimated Total: ~450 KB
- Estimated Savings: ~290 KB (39% reduction)
- Tailwind CSS: ~35 KB (purged)
- Radix Primitives: ~80 KB
- Main bundle: Expected reduction to ~300 KB

## Notes & Gotchas

1. **Tailwind v4 @apply limitations**: Cannot use @apply with CSS custom properties in @layer base. Use raw CSS instead.
2. **Dark mode**: Uses class strategy (`.dark`) not media queries
3. **Focus rings**: Tailwind includes focus-visible by default
4. **Responsive design**: Still desktop-first, but Tailwind makes mobile easier when needed
5. **Animation**: Radix includes data-state animations out of the box

## Next Steps
1. Test AppLayout.shadcn.tsx in browser (swap import in App.tsx temporarily)
2. Migrate Dashboard subcomponents (StatCard, TankCard, etc.)
3. Migrate feature screens one at a time
4. Remove MUI dependencies
5. Celebrate! 🎉
