# My Tanks 🐠

A modern, feature-rich aquarium management Progressive Web App built with React 19, TypeScript, and Supabase. Track multiple tanks, manage fish populations, monitor bioload, and stay on top of maintenance with smart reminders.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)

**🌐 Live Demo:** [https://dhavalvagh.github.io/my-tanks/](https://dhavalvagh.github.io/my-tanks/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [How to Use](#-how-to-use)
  - [Authentication](#authentication)
  - [Managing Tanks](#managing-tanks)
  - [Managing Fish](#managing-fish)
  - [Maintenance Logs](#maintenance-logs)
  - [Reminders](#reminders)
- [Development Guide](#-development-guide)
  - [Project Structure](#project-structure)
  - [Architecture](#architecture)
  - [State Management](#state-management)
  - [Component Patterns](#component-patterns)
  - [Adding New Features](#adding-new-features)
- [Database Setup](#-database-setup)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Tank Management
- 📏 **Volume Calculator** - Automatic calculation from dimensions (L × W × H)
- ⚙️ **Advanced Adjustments** - Account for headspace, substrate depth, and glass thickness
- 💧 **Flow Rate Recommendations** - Suggested filter rates for planted and fish-only tanks
- 🏷️ **Custom Labels** - Organize tanks by type (community, planted, shrimp, etc.)

### Fish Tracking
- 🐟 **Species Database** - Autocomplete with common aquarium fish
- 📸 **Photo Uploads** - Store fish images in Supabase storage
- 📊 **Bioload Monitoring** - Real-time capacity analysis per tank
- 🎯 **Advanced Options** - Manual override for max size, bioload, and date added
- 🔍 **Fish Details** - Dedicated detail page for each fish with full information

### Maintenance & Monitoring
- 💧 **Water Change Logs** - Track water changes with volume and date
- 🍽️ **Feeding Records** - Log feeding times and food types
- ⏰ **Smart Reminders** - Browser notifications for scheduled maintenance
- 📈 **Stocking Analysis** - Color-coded warnings (safe, caution, overstocked)
- 📊 **Dashboard** - Unified view of all tanks, fish, and recent activity

### User Experience
- 🔐 **Secure Authentication** - Username-based auth via Supabase
- 💾 **Dual Storage** - Instant localStorage backup + cloud sync
- 🎨 **Material Design** - Clean, modern UI with gradient cards and proper elevation
- 📱 **PWA Ready** - Install as native app on desktop or mobile
- 🌐 **Offline Support** - Local storage fallback when offline
- ⚡ **Fast & Responsive** - Built with Vite for optimal performance

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with improved rendering and hooks
- **TypeScript 5.6** - Type-safe development
- **Vite 6** - Lightning-fast build tool and dev server
- **CSS Variables** - Custom design system with Material Design principles

### Backend
- **Supabase** - Backend-as-a-Service
  - **Authentication** - User management with username-based auth
  - **PostgreSQL** - JSON state storage in `app_state` table
  - **Storage** - Image uploads in `fish-photos` bucket
  - **Row Level Security** - User data isolation

### Development Tools
- **ESLint** - Code quality and consistency
- **TypeScript** - Static type checking
- **GitHub Actions** - CI/CD for automated deployment

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier available)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhavalvagh/my-tanks.git
   cd my-tanks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see next section)

4. **Start development server**
   ```bash
   npm run dev
   ```

   App will be available at `http://localhost:5173/my-tanks/`

### Environment Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for database provisioning (~2 minutes)

2. **Copy environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Add your Supabase credentials to `.env.local`**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_STORAGE_BUCKET=fish-photos
   ```

   Find these values in Supabase Dashboard → Settings → API

4. **Run database migrations** (see [Database Setup](#-database-setup))

---

## 📖 How to Use

### Authentication

1. **Sign Up**
   - Click "Sign up" on the landing page
   - Enter a username and password (no email required)
   - Username becomes `username@users.example.com` internally

2. **Login**
   - Use your username and password
   - State syncs from cloud if available
   - Falls back to localStorage if offline

3. **Sign Out**
   - Click username in top-right → "Sign out"
   - Local data remains but cloud sync stops

### Managing Tanks

#### Add a Tank
1. Navigate to **Tanks** in the sidebar
2. Fill in the form:
   - **Name** - Tank identifier (e.g., "Living Room 60L")
   - **Label** - Type/category (community, planted, shrimp, etc.)
   - **Dimensions** - Length × Width × Height in cm
   - Click **⚙️ Advanced Options** for:
     - **Headspace** - Distance from water surface to rim
     - **Substrate Depth** - Gravel/sand layer thickness
     - **Glass Thickness** - Reduces internal dimensions
     - **Flow Rate** - Liters per hour (auto-suggested)
3. Click **Save tank**

#### Volume Calculation
The app automatically calculates water volume:
```
Volume = (Length - 2×Glass) × (Width - 2×Glass) × (Height - Headspace - Substrate) ÷ 1000
```

Example: 60×30×35 cm tank with 2cm headspace, 3cm substrate, 0.5cm glass
```
(60 - 1) × (30 - 1) × (35 - 2 - 3) ÷ 1000 = 51.5L
```

#### Edit/Delete Tanks
- Click **Edit** button on any tank card
- Modify fields and click **Update tank**
- Click **Delete** to remove (confirms first)
- Deleting a tank also removes associated fish, logs, and reminders

### Managing Fish

#### Add Fish
1. Navigate to **Fish** in the sidebar
2. Fill in the form:
   - **Species** - Start typing to see autocomplete suggestions
   - **Count** - Number of individuals
   - **Tank** - Select from dropdown
   - Click **⚙️ Advanced Options** for:
     - **Max Size** - Adult size in cm (auto-filled from species)
     - **Bioload** - Per-fish load value (auto-calculated)
     - **Date Added** - When fish were added to tank
3. Optionally **Upload Photo**
4. Click **Save fish**

#### Fish Detail Page
- Click any fish card to view detailed information:
  - **Photo** - Full-size image (if uploaded)
  - **Basic Info** - Species, count, tank assignment
  - **Size & Bioload** - Max size, per-fish bioload, total bioload
  - **Timeline** - Date added with days-ago counter
- Edit or delete from detail page

#### Bioload Calculation
Automatic bioload formula (when not manually specified):
```
Bioload = max(0.3, (MaxSize ÷ 5) × 0.5)
```

Examples:
- 2cm fish → `max(0.3, 0.2)` = **0.3**
- 10cm fish → `(10 ÷ 5) × 0.5` = **1.0**
- 25cm fish → `(25 ÷ 5) × 0.5` = **2.5**

Total bioload = Per-fish bioload × Count

#### Stocking Status
Color-coded warnings based on bioload ratio:
- 🟢 **Safe** - Bioload < 70% capacity
- 🟡 **Caution** - Bioload 70-90% capacity
- 🔴 **Overstocked** - Bioload > 90% capacity

Capacity = Tank volume × 0.8 (80% rule of thumb)

### Maintenance Logs

#### Water Changes
1. Navigate to **Logs & Reminders**
2. Under "Water Changes" section:
   - Select tank
   - Enter volume changed (liters)
   - Click **Log change**
3. View history with timestamps
4. "Last changed" updates on tank cards

#### Feeding Logs
1. In "Feedings" section:
   - Select tank
   - Enter food type/brand
   - Click **Log feeding**
2. Track feeding patterns over time

### Reminders

#### Create Reminder
1. In "Reminders" section, click **+ Reminder**
2. Fill in:
   - **Title** - Reminder description
   - **Type** - Water change or Feeding
   - **Every X hours** - Frequency
   - **Tank** - Optional tank assignment
3. Click **Create**

#### How Reminders Work
- Browser checks every 60 seconds for overdue reminders
- Notification fires when `nextDue` timestamp passes
- Auto-updates `nextDue` for next occurrence
- Requires notification permission (prompted on first use)
- Only works when browser is open (browser API limitation)

#### Toggle On/Off
- Click switch to enable/disable
- Disabled reminders don't fire notifications
- Re-enabling recalculates `nextDue` from current time

---

## 💻 Development Guide

### Project Structure

```
my-tanks/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml        # GitHub Pages deployment
│   │   └── ci.yml            # Build & lint checks
│   └── copilot-instructions.md # AI coding guidelines
├── public/
│   └── manifest.json         # PWA manifest
├── src/
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard sub-components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FishListItem.tsx
│   │   │   ├── SectionCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── TankCard.tsx
│   │   ├── AppLayout.tsx     # Three-column layout shell
│   │   ├── AuthForm.tsx      # Login/signup form
│   │   ├── Dashboard.tsx     # Landing page
│   │   ├── FishDetail.tsx    # Single fish view
│   │   ├── FishManager.tsx   # Fish CRUD
│   │   ├── LogsManager.tsx   # Maintenance logs
│   │   ├── ReminderPanel.tsx # Reminder CRUD
│   │   ├── SpeciesAutocomplete.tsx # Fish species picker
│   │   ├── StockingCard.tsx  # Tank bioload card
│   │   ├── StockingStatus.tsx # Status display
│   │   ├── TankDetail.tsx    # Single tank view
│   │   └── TankManager.tsx   # Tank CRUD
│   ├── hooks/                # Custom React hooks
│   │   ├── useAppState.ts    # State + persistence
│   │   ├── useAuth.ts        # Supabase authentication
│   │   ├── useNavigation.ts  # Routing & history
│   │   └── useReminders.ts   # Notification scheduling
│   ├── services/             # Business logic
│   │   ├── notifications.ts  # Browser notifications
│   │   ├── stocking.ts       # Bioload calculations
│   │   └── supabase.ts       # Supabase client config
│   ├── App.tsx               # Root component
│   ├── App.css               # Component styles
│   ├── design-system.css     # Design tokens
│   ├── index.css             # Global styles
│   └── main.tsx              # Entry point
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML template
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── tsconfig.app.json         # App-specific TS config
├── tsconfig.node.json        # Node-specific TS config
└── vite.config.ts            # Vite configuration
```

### Architecture

#### Monolithic State Management
All app state lives in a single `AppState` object in `App.tsx`:

```typescript
type AppState = {
  profile: { username: string; email?: string | null }
  tanks: Tank[]
  fishes: FishRecord[]
  waterChanges: WaterChange[]
  feedings: Feeding[]
  reminders: Reminder[]
}
```

**State Updates:**
- Immutable updates via `setState()` callback
- No external state library (pure React `useState`)
- Passed down to children as props + callbacks

#### Custom Hooks Pattern

**useAppState** - State persistence
```typescript
const { state, setState, hydrated, saving, error } = useAppState(userId)
```
- Instant localStorage writes on every change
- Debounced Supabase writes (450ms delay)
- Logout cleanup (resets to default state)

**useNavigation** - Routing
```typescript
const { activeView, selectedTankId, selectedFishId, setActiveView } = useNavigation()
```
- Browser history + URL hash sync
- Persists to localStorage
- Views: dashboard | tanks | fish | logs | tank-detail | fish-detail

**useAuth** - Authentication
```typescript
const { userId, status, handleAuth, signOut } = useAuth()
```
- Synthetic email generation: `{username}@users.example.com`
- Listens to `onAuthStateChange`

**useReminders** - Notifications
```typescript
useReminders(state.reminders, hydrated, tankName, updateReminders)
```
- Checks every 60s via `setInterval`
- Fires notifications for overdue enabled reminders

### State Management

#### Data Flow

```
User Action
    ↓
Event Handler in Component
    ↓
Callback Prop to Parent (App.tsx)
    ↓
setState() with Immutable Update
    ↓
useAppState Hook
    ├─→ Instant localStorage.setItem()
    └─→ Debounced Supabase upsert (450ms)
    ↓
Re-render with New State
```

#### Component Communication

**Parent → Child**: Pass state slices + callbacks
```tsx
<TankManager 
  tanks={state.tanks}
  onSave={handleSaveTank}
  onDelete={handleDeleteTank}
/>
```

**Child State**: Local `useState` for forms
```tsx
const [draftTank, setDraftTank] = useState<Partial<Tank>>({})
const [editingTankId, setEditingTankId] = useState<string | null>(null)
```

### Component Patterns

#### Card Architecture
All cards use consistent structure:
```tsx
<div style={{ padding: 0, overflow: "hidden" }}>
  {/* Gradient Header */}
  <div style={{ 
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    padding: "var(--space-5)",
    color: "white"
  }}>
    <p className="eyebrow">{label}</p>
    <h3 style={{ fontSize: "var(--text-2xl)" }}>{name}</h3>
    <p style={{ fontSize: "var(--text-sm)" }}>{metadata}</p>
  </div>
  
  {/* Content Section */}
  <div style={{ padding: "var(--space-5)" }}>
    {children}
  </div>
</div>
```

#### Form Pattern
```tsx
<div className="form-grid">
  <label className="full">
    <span>Field Label</span>
    <input value={draft.field} onChange={(e) => setDraft({...draft, field: e.target.value})} />
  </label>
</div>

<details>
  <summary>⚙️ Advanced Options</summary>
  <div className="form-grid">
    {/* Advanced fields */}
  </div>
</details>

<div style={{ display: "flex", gap: "var(--space-2)" }}>
  <button className="primary" onClick={save}>Save</button>
  {editing && <button className="ghost" onClick={cancel}>Cancel</button>}
</div>
```

### Adding New Features

#### 1. Add State Field
In `useAppState.ts`:
```typescript
type AppState = {
  // ... existing fields
  newFeature: NewFeatureType[]
}

const defaultState: AppState = {
  // ... existing defaults
  newFeature: []
}
```

#### 2. Create Component
```bash
src/components/NewFeatureManager.tsx
```

```tsx
import { useState } from "react"

type Props = {
  items: NewFeatureType[]
  onSave: (item: NewFeatureType) => void
  onDelete: (id: string) => void
}

export default function NewFeatureManager({ items, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<Partial<NewFeatureType>>({})
  
  function save() {
    const item: NewFeatureType = {
      id: crypto.randomUUID(),
      ...draft,
      createdAt: Date.now()
    }
    onSave(item)
    setDraft({})
  }
  
  return (
    <section className="card">
      {/* Form fields */}
    </section>
  )
}
```

#### 3. Wire Up in App.tsx
```tsx
function handleSaveFeature(item: NewFeatureType) {
  setState(prev => ({
    ...prev,
    newFeature: [...prev.newFeature, item]
  }))
}

// In render:
{activeView === "new-feature" && (
  <NewFeatureManager
    items={state.newFeature}
    onSave={handleSaveFeature}
    onDelete={handleDeleteFeature}
  />
)}
```

#### 4. Add Navigation
In `useNavigation.ts`:
```typescript
type View = "dashboard" | "tanks" | "fish" | "logs" | "tank-detail" | "fish-detail" | "new-feature"
```

In `AppLayout.tsx` sidebar:
```tsx
<button onClick={() => onNavigate("new-feature")}>
  New Feature
</button>
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173/my-tanks/)
npm run build        # Type check + build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint with auto-fix
npx tsc --noEmit     # Type check without building

# Deployment
git push origin main # Triggers GitHub Actions deployment
```

---

## 🗄️ Database Setup

### Supabase SQL Schema

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- ============================================
-- Table: app_state
-- ============================================
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

-- Index for faster lookups
CREATE INDEX idx_app_state_user_id ON app_state(user_id);

-- ============================================
-- Storage: fish-photos bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('fish-photos', 'fish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload fish photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fish-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Public read access to all photos
CREATE POLICY "Public read access to fish photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fish-photos');

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fish-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### JSONB State Structure

The `app_state.state` column stores:

```json
{
  "profile": {
    "username": "dhavalvagh",
    "email": "dhavalvagh@users.example.com"
  },
  "tanks": [
    {
      "id": "uuid-v4",
      "name": "Living Room 60L",
      "label": "community",
      "lengthCm": 60,
      "widthCm": 30,
      "heightCm": 35,
      "headspaceCm": 2,
      "substrateDepthCm": 3,
      "glassThicknessCm": 0.5,
      "volumeLiters": 51.5,
      "flowRateLph": 200,
      "notes": "Heavily planted"
    }
  ],
  "fishes": [
    {
      "id": "uuid-v4",
      "name": "Neon Tetra",
      "count": 10,
      "tankId": "tank-uuid",
      "imageUrl": "https://...supabase.co/storage/...",
      "maxSizeCm": 4,
      "bioload": 0.4,
      "addedAt": 1707523200000
    }
  ],
  "waterChanges": [
    {
      "id": "uuid-v4",
      "tankId": "tank-uuid",
      "volumeLiters": 15,
      "changedAt": 1707523200000
    }
  ],
  "feedings": [
    {
      "id": "uuid-v4",
      "tankId": "tank-uuid",
      "food": "Tetra flakes",
      "fedAt": 1707523200000
    }
  ],
  "reminders": [
    {
      "id": "uuid-v4",
      "title": "Weekly water change",
      "tankId": "tank-uuid",
      "type": "water-change",
      "everyHours": 168,
      "nextDue": 1707523200000,
      "enabled": true
    }
  ]
}
```

---

## 🚀 Deployment

### GitHub Pages (Automated)

This project auto-deploys on every push to `main` via GitHub Actions.

#### Initial Setup

1. **Create GitHub Repository**
   ```bash
   # Already done if you cloned from github.com/dhavalvagh/my-tanks
   ```

2. **Configure GitHub Pages**
   - Go to: Settings → Pages
   - Source: **GitHub Actions** (not "Deploy from a branch")

3. **Add Environment Secrets**
   - Go to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

4. **Push to Deploy**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

5. **Monitor Deployment**
   - Go to: Actions tab
   - Watch "Deploy to GitHub Pages" workflow
   - Takes ~2-3 minutes
   - Live at: `https://dhavalvagh.github.io/my-tanks/`

#### Manual Deployment

```bash
npm run build
npx gh-pages -d dist
```

### Vite Configuration

Base path for GitHub Pages in `vite.config.ts`:
```typescript
export default defineConfig({
  base: "/my-tanks/",  // Must match repository name
  // ...
})
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/my-tanks.git
   cd my-tanks
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Use TypeScript strict mode
   - Add comments for complex logic
   - Update types when changing data structures

4. **Test your changes**
   ```bash
   npm run dev         # Test locally
   npm run lint        # Check code style
   npx tsc --noEmit    # Type check
   npm run build       # Ensure it builds
   ```

5. **Commit with clear message**
   ```bash
   git add .
   git commit -m "feat: add species filter to fish list

   - Added dropdown to filter by species
   - Updated FishManager component
   - Added unit tests"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   # Create Pull Request on GitHub
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Code Style

- Use **functional components** with hooks
- Prefer **arrow functions** for components
- Use **TypeScript strict mode** (no `any` types)
- Follow **Material Design** principles for UI
- Use **CSS variables** from design system
- Extract complex logic to **custom hooks**
- Keep components **< 300 lines** (extract if larger)

### Pull Request Guidelines

- **Title**: Clear, concise description
- **Description**: 
  - What changes were made
  - Why the change was needed
  - Screenshots (if UI changes)
  - Related issues (if any)
- **Tests**: Verify all features work
- **Docs**: Update README if needed

### Areas for Contribution

**Features:**
- Import/export functionality (JSON backup)
- Tank history graphs (bioload over time)
- Water parameter tracking (pH, temp, etc.)
- Equipment tracking (filters, heaters, lights)
- Species compatibility checker
- Cost tracking for maintenance/fish purchases
- Multi-language support

**Improvements:**
- Mobile responsive design
- Dark mode theme
- Offline-first PWA with service worker
- Unit tests with Vitest
- E2E tests with Playwright
- Performance optimizations
- Accessibility improvements (ARIA labels)

**Documentation:**
- Video tutorials
- Screenshots for README
- API documentation
- Deployment guides for other platforms

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Dhaval Vagh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Author

**Dhaval Vagh**

- GitHub: [@dhavalvagh](https://github.com/dhavalvagh)
- Email: vaghakash@gmail.com

---

## 🙏 Acknowledgments

- **React Team** - For React 19 and excellent documentation
- **Supabase** - For providing free backend infrastructure
- **Vite Team** - For the incredibly fast build tool
- **Material Design** - For design inspiration and principles
- **Aquarium Community** - For feedback and feature suggestions

---

## 📸 Screenshots

*Coming soon - Will add screenshots of Dashboard, Tank Manager, Fish Details, and Stocking Analysis*

---

## 🗺️ Roadmap

### v1.1 (Q2 2026)
- [ ] Mobile responsive design
- [ ] Dark mode theme
- [ ] Import/export JSON backups
- [ ] Tank history graphs

### v1.2 (Q3 2026)
- [ ] Water parameter tracking
- [ ] Equipment management
- [ ] Cost tracking
- [ ] Species compatibility checker

### v2.0 (Q4 2026)
- [ ] Multi-user sharing (family/friends)
- [ ] Social features (share tank photos)
- [ ] AI fish disease detection
- [ ] Integration with smart devices

---

**Happy Fishkeeping! 🐠💙**

*Built with ❤️ for the aquarium hobby community*
