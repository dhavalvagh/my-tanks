# My Tanks - AI Coding Instructions

## Project Overview
React + TypeScript aquarium management app with Supabase backend. Users track multiple tanks, fish stocking, water changes, feedings, and set reminders. Built with Vite + React 19.

## Architecture & Data Flow

### Monolithic State Management with Hook Extraction
All app state lives in a single `AppState` object managed in [App.tsx](../src/App.tsx) (~150 lines):
- **State Structure**: `profile`, `tanks[]`, `fishes[]`, `waterChanges[]`, `feedings[]`, `reminders[]`
- **State Updates**: Immutable object spreads via `setState()` callback passed to child components
- **No External State Library**: Pure React `useState` for all state management
- **Side Effects in Hooks**: State persistence, navigation, auth, reminders all in custom hooks (see [hooks/](../src/hooks/))

### Component Communication Pattern
**Parent → Child**: Pass state slices + callback functions
```tsx
<TankManager 
  tanks={state.tanks} 
  onSave={handleSaveTank}   // Updates parent state
  onDelete={handleDeleteTank}
  onOpenDetail={handleOpenTankDetail} // Navigation
/>
```

**Child State**: Local `useState` for form drafts, editing modes, UI toggles
```tsx
// Inside TankManager.tsx
const [draftTank, setDraftTank] = useState<Partial<Tank>>({...})
const [editingTankId, setEditingTankId] = useState<string | null>(null)
```

### Dual Persistence Strategy
1. **LocalStorage**: Instant writes on every state change via `useEffect` - privacy-first fallback
2. **Supabase**: Debounced writes (450ms) to `app_state` table storing entire state as JSONB
3. Hydration: LocalStorage loads first, then Supabase overwrites on auth

### Authentication Pattern
- Username-based auth with synthetic emails: `{username}@users.example.com`
- Supabase Auth handles sessions; user metadata stores username
- Single-column Supabase table: `app_state(user_id, state:jsonb)`

## Component Structure

### ✅ Extracted Component Architecture
**Successfully moved from monolithic App.tsx to component-based:**
- **App.tsx** (~150 lines): Orchestrates layout, navigation, and top-level state management
- **TankManager.tsx**: Full CRUD for tanks with volume calculator, flow rate suggestions, advanced options
- **FishManager.tsx**: Full CRUD for fish with image uploads, species autocomplete, bioload tracking

### Component Extraction Pattern (Established)
Following this proven pattern for future extractions:
1. **State Lifting**: Components receive state slices + `setState` callback from parent
2. **Local Draft State**: Each manager owns its `draftTank`/`draftFish` + `editingId` for form handling
3. **Callback Props**: `onSave`, `onDelete`, `onUploadImage` for parent state updates
4. **Pure Presentation**: Pass through functions like `tankNameLookup` for display logic

### Component Inventory
**Feature Components:**
- [TankManager.tsx](../src/components/TankManager.tsx): Tank CRUD with dimension calculator, label chips, advanced fields
- [FishManager.tsx](../src/components/FishManager.tsx): Fish CRUD with image handling (upload/URL), species autocomplete
- [LogsManager.tsx](../src/components/LogsManager.tsx): Water changes, feedings, reminders with inline forms
- [Dashboard.tsx](../src/components/Dashboard.tsx): Adaptive grid layout, stats cards, tank/fish previews
- [TankDetail.tsx](../src/components/TankDetail.tsx): Single tank view with stocking analysis
- [AppLayout.tsx](../src/components/AppLayout.tsx): Three-column layout shell, navigation sidebar, topbar

**Utility Components:**
- [StockingStatus.tsx](../src/components/StockingStatus.tsx): Bioload calculation display (pure presentational)
- [StockingCard.tsx](../src/components/StockingCard.tsx): Individual tank stocking visualization
- [ReminderPanel.tsx](../src/components/ReminderPanel.tsx): Reminder CRUD with internal draft state
- [SpeciesAutocomplete.tsx](../src/components/SpeciesAutocomplete.tsx): Local fish species dropdown with filtering
- [AuthForm.tsx](../src/components/AuthForm.tsx): Login/signup toggle form

**Dashboard Sub-components** (modular, reusable):
- [StatCard.tsx](../src/components/dashboard/StatCard.tsx): Stat display with icon, value, label, and optional change indicator
- [TankCard.tsx](../src/components/dashboard/TankCard.tsx): Interactive tank card (clickable button with consistent styling)
- [FishListItem.tsx](../src/components/dashboard/FishListItem.tsx): Fish list item with avatar/image, name, count, and tank
- [SectionCard.tsx](../src/components/dashboard/SectionCard.tsx): Wrapper for dashboard sections with title/subtitle
- [EmptyState.tsx](../src/components/dashboard/EmptyState.tsx): Empty state display with icon, title, description, and optional action

### Custom Hooks Pattern
All side-effect logic extracted to custom hooks:
- **[useAppState.ts](../src/hooks/useAppState.ts)**: LocalStorage + Supabase state sync
  - Returns `{ state, setState, hydrated, saving, error }`
  - Instant localStorage writes on every state change
  - Debounced Supabase writes (450ms delay)
  - Handles logout cleanup (resets to default state)
  
- **[useNavigation.ts](../src/hooks/useNavigation.ts)**: Browser history + URL hash sync
  - Returns `{ activeView, selectedTankId, setActiveView, setSelectedTankId }`
  - Syncs with `window.history.pushState` + `popstate` events
  - Persists to localStorage key `"tank-twins-nav"`
  
- **[useAuth.ts](../src/hooks/useAuth.ts)**: Supabase auth session management
  - Returns `{ userId, status, handleAuth, signOut }`
  - Synthetic email generation: `{username}@users.example.com`
  - Listens to `onAuthStateChange` for session updates
  
- **[useReminders.ts](../src/hooks/useReminders.ts)**: Browser notification scheduling
  - Checks reminders every 60s via `setInterval`
  - Fires notifications for overdue enabled reminders
  - Auto-updates `nextDue` timestamp after notification

## Service Layer Patterns

### Bioload Calculation ([src/services/stocking.ts](../src/services/stocking.ts))
- `litersFromDimensions()`: Calculate tank volume with headspace/substrate/glass adjustments
- `calculateStocking()`: Returns `{ load, capacity, ratio, status, warnings[] }`
- Status thresholds: `<0.7 = safe`, `0.7-0.9 = caution`, `>0.9 = overstocked`
- Bioload defaults: `size/5 * 0.5` if not manually specified

### Supabase Config ([src/services/supabase.ts](../src/services/supabase.ts))
- Requires env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Auth storage key: `tank-twins-auth` for session persistence

### Notifications ([src/services/notifications.ts](../src/services/notifications.ts))
- Browser Notification API wrapper
- `requestPermission()` called on hydration
- Reminders checked every 60s via `setInterval` in [App.tsx](../src/App.tsx)

## Development Commands

```bash
npm run dev      # Vite dev server (http://localhost:5173/my-tanks/)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint with TypeScript
npm run preview  # Preview production build
```

## Common Development Workflows

### Adding a New Feature Component
Follow the established extraction pattern (see TankManager/FishManager):
1. Create component file in `src/components/`
2. Define prop types including state slice + callback functions
3. Add local `useState` for draft/editing states
4. Import types from other components: `import type { Tank } from "./TankManager"`
5. Update App.tsx to import and render component with proper callbacks

### Adding State to AppState
1. Update `AppState` type in [useAppState.ts](../src/hooks/useAppState.ts)
2. Add field to `defaultState` object with sensible default
3. Update parent component (App.tsx) to pass new state slice to children
4. Existing users' state will auto-merge with defaults on next hydration

### Adding a New Service Function
1. Add to appropriate file in `src/services/`:
   - `stocking.ts` - calculations, bioload logic
   - `notifications.ts` - browser notification helpers
   - `supabase.ts` - database/storage operations (rare, mostly config)
2. Export pure functions with clear input/output types
3. No side effects - keep hooks for state mutations

### Working with Images
**Upload flow:**
1. User selects file via `<input type="file" />`
2. Parent component (FishManager) calls `onUploadImage(file)`
3. App.tsx handler uploads to Supabase Storage bucket `fish-photos`
4. Returns public URL: `https://{project}.supabase.co/storage/v1/object/public/fish-photos/...`
5. Component saves URL with `imageSource: "upload"`

**URL flow:**
1. User pastes URL directly into input
2. Component updates draft state with `imageSource: "url"`
3. Image renders via `<img src={imageUrl} />`

## Supabase Database Schema

### `app_state` Table
```sql
CREATE TABLE app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own state
CREATE POLICY "Users can CRUD their own state"
  ON app_state
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### `fish-photos` Storage Bucket
```sql
-- Create storage bucket for fish images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fish-photos', 'fish-photos', true);

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload fish photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fish-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Public read access to all fish photos
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fish-photos');
```

### AppState JSONB Structure
```typescript
{
  profile: { username: string, email?: string | null },
  tanks: Array<{
    id: string,
    name: string,
    label: string,
    lengthCm?: number,
    widthCm?: number,
    heightCm?: number,
    headspaceCm?: number,
    substrateDepthCm?: number,
    glassThicknessCm?: number,
    volumeLiters: number,
    flowRateLph?: number,
    notes?: string
  }>,
  fishes: Array<{
    id: string,
    name: string,
    count: number,
    tankId: string,
    imageUrl?: string,
    imageSource?: "wikimedia" | "upload" | "url",
    maxSizeCm?: number | null,
    bioload?: number | null,
    addedAt: number
  }>,
  waterChanges: Array<{
    id: string,
    tankId: string,
    volumeLiters: number,
    changedAt: number
  }>,
  feedings: Array<{
    id: string,
    tankId: string,
    food: string,
    fedAt: number,
    notes?: string
  }>,
  reminders: Array<{
    id: string,
    title: string,
    tankId?: string,
    type: "water-change" | "feeding",
    everyHours: number,
    nextDue: number,
    enabled: boolean
  }>
}
```

## Testing & Debugging

### Manual Testing Checklist
**Auth Flow:**
- [ ] Sign up with username + password (no email confirmation needed)
- [ ] Log out and log back in (state should persist)
- [ ] Verify LocalStorage fallback works without network

**Tank Management:**
- [ ] Create tank with dimensions → verify volume calculation
- [ ] Edit tank → check advanced fields (headspace, substrate, glass)
- [ ] Delete tank → verify cascade deletion of fish/logs/reminders

**Fish Management:**
- [ ] Add fish with species autocomplete → metadata populates
- [ ] Upload fish photo → verify Supabase Storage path
- [ ] Paste image URL → verify preview renders
- [ ] Check bioload calculation on dashboard

**Logs & Reminders:**
- [ ] Log water change → verify "last change" updates
- [ ] Create reminder → test browser notification permission
- [ ] Disable/enable reminder toggle
- [ ] Wait 60s after due time → verify notification fires

**Navigation:**
- [ ] Browser back/forward buttons sync with app state
- [ ] URL hash updates on view changes
- [ ] Refresh page → verify navigation state restored

### Debugging Tools
```bash
# Check Supabase connection
# Open browser DevTools → Network tab → filter by "supabase"

# Inspect localStorage
localStorage.getItem('tank-twins-state')
localStorage.getItem('tank-twins-nav')

# Check auth session
supabase.auth.getSession()

# View notification permission
Notification.permission  # "default" | "granted" | "denied"
```

### Common Issues
1. **"Could not load data"**: Check Supabase env vars and RLS policies
2. **Images not uploading**: Verify `fish-photos` bucket exists and is public
3. **State not persisting**: Check browser console for localStorage quota errors
4. **Notifications not firing**: Ensure HTTPS (or localhost) + permission granted

## Deployment (GitHub Pages)

### Setup Steps
1. **Build for production:**
   ```bash
   npm run build  # Output to dist/
   ```

2. **GitHub Pages configuration:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (or `main`) → `/root` (or `/docs` if copying build there)

3. **Deploy script** (add to `package.json`):
   ```json
   {
     "scripts": {
       "deploy": "npm run build && npx gh-pages -d dist"
     }
   }
   ```
   Then install: `npm install -D gh-pages`

4. **Environment variables:**
   - Create `.env.production` with Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - **Never commit `.env.production`** (add to `.gitignore`)

5. **First deployment:**
   ```bash
   npm run deploy  # Pushes dist/ to gh-pages branch
   ```

6. **Access your app:**
   - URL: `https://<username>.github.io/my-tanks/`
   - Verify `base: "/my-tanks/"` in [vite.config.ts](../vite.config.ts) matches repo name

### CI/CD with GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Add secrets:** Repository Settings → Secrets and variables → Actions → New repository secret

## Key Conventions

### ID Generation
Use `crypto.randomUUID()` for all new entities (tanks, fish, logs, reminders)

### Date Handling
- Store as Unix timestamps (`Date.now()`)
- Format for display in component: `new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })` → `"Jan 5, 11:30 AM"`

### Navigation State
- Single `activeView` state: `"dashboard" | "tanks" | "fish" | "logs" | "tank-detail"`
- Browser history synced via `window.history.pushState/popstate` listeners in [useNavigation.ts](../src/hooks/useNavigation.ts)
- URL hash format: `#dashboard`, `#tank-detail:${tankId}`
- Persist nav state to localStorage separately from app state (key: `"tank-twins-nav"`)

### Editing Pattern (Standard Across Components)
Dual draft states for inline edits in manager components:
```tsx
const [draftTank, setDraftTank] = useState<Partial<Tank>>({ label: "other", volumeLiters: 60 })
const [editingTankId, setEditingTankId] = useState<string | null>(null)

// On Edit button click
function startEdit(tank: Tank) {
  setDraftTank({ name: tank.name, label: tank.label, /* ... */ })
  setEditingTankId(tank.id)
}

// On Save
function saveTank() {
  const tankData: Tank = { id: editingTankId || crypto.randomUUID(), /* ... */ }
  onSave(tankData)  // Callback to parent
  setDraftTank({ label: "other", volumeLiters: 60 })
  setEditingTankId(null)
}
```

### Image Handling
Fish images via three sources (check `imageSource` field):
- `"url"` - User pastes direct URL, displayed as-is
- `"upload"` - Supabase Storage bucket path: `fish-photos/users/{userId}/fish/{timestamp}-{filename}`
- `"wikimedia"` - Unused/deprecated (feature disabled, but type remains)

### Form Validation Pattern
**No formal validation library** - inline checks before save:
```tsx
function saveTank() {
  if (!draftTank.name) return  // Silent fail if required fields missing
  const volume = litersFromDimensions(...)
  if (!volume) return  // Silent fail if calculation returns 0
  // Proceed with save
}
```

## TypeScript Patterns
- Inline type definitions at file top (no separate types folder)
- Partial types for draft states: `Partial<Tank>`, `Partial<FishRecord>`
- Strict null checks: Use `?? null` for optional numeric fields

## Design System

### Material Design Principles
- **Desktop-First**: Built exclusively for desktop (1280px+ viewports), no mobile responsive code
- **Material Theme**: Flat colors, elevation through shadows, no glassmorphism/transparency
- **Vibrant Palette**: Bold, saturated colors following Material Design color system
- **Elevation System**: 0dp to 24dp shadows for depth hierarchy
- **Interactive Elements**: Rich graphics, images, animations for engaging UX

### Three-Column Layout Pattern
All pages except Dashboard follow this structure:
- **Left Sidebar (240px)**: Navigation menu, always visible by default, user can toggle hide
- **Center Content (flex-1)**: Main forms, CRUD operations, primary interactions
- **Right Sidebar (320px)**: Context info, existing lists, previews, quick stats

### Dashboard Layout
- **Landing Page**: Information-dense grid utilizing full viewport height
- **No Scrolling**: All critical information fits within viewport (1280x720 minimum)
- **Data Visualization**: Charts, stats cards, quick actions, live metrics
- **Full-Width Utilization**: Multi-column grid maximizing screen real estate

## Styling
- Design system in [design-system.css](../src/design-system.css) with Material Design tokens
- Component-specific styles in [App.css](../src/App.css)
- **Consistent Design Classes** (use these throughout the project):
  - **Cards**: `.card`, `.card-header`, `.card-title`, `.card-subtitle`, `.card-body`, `.card-actions`
  - **Interactive Cards**: `.interactive-card`, `.interactive-card__header`, `.interactive-card__title`, `.interactive-card__body`
  - **Lists**: `.list-item`, `.list-item-media`, `.list-item-image`, `.list-item-avatar`, `.list-item-content`, `.list-item-title`, `.list-item-subtitle`
  - **Empty States**: `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-description`
  - **Meta Text**: `.meta-text`, `.meta-text-separator`, `.meta-text-strong`
  - **Status Pills**: `.pill.success`, `.pill.warning`, `.pill.error`, `.pill.info`, `.pill.subtle`
- Status colors via Material Design palette: `.success`, `.warning`, `.error`, `.info`
- No mobile breakpoints - desktop-only implementation

## Deployment
Vite config sets `base: "/my-tanks/"` for GitHub Pages deployment
