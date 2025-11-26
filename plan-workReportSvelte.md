# Plan: Build Work Report Application in SvelteKit

Build a modern work report tracking application from scratch using SvelteKit with TypeScript. This application will track weekly, monthly, and yearly work hours with real-time synchronization, financial calculations, goal tracking, and data visualization. The app will feature dark mode, data export capabilities, and a polished UI using shadcn-svelte components.

**Building from scratch** means we'll create the complete SvelteKit project structure, implement all features step-by-step, and ensure proper API integration from the beginning.

## Reference Application Analysis

> **Note**: This section documents the existing Next.js application for reference. We'll use this as a blueprint for what features to implement in our new SvelteKit application.

### Features to Implement


 1. **Weekly Work Time Tracking** - Track work hours/minutes for current and previous week
 2. **Date Range Navigation** - Navigate between weeks (prev/next) with Monday-Sunday week structure
 3. **Real-time Data Sync** - Refresh button to sync latest work data from backend
 4. **Context-Aware Comparison** - Side-by-side comparison based on current view: week vs previous week, month vs previous month, year vs previous year
 5. **Financial Calculations** - Automatic income calculation in BDT and USD
 6. **Currency Conversion** - Auto-fetch USD to BDT exchange rate from geoplugin.net API
 7. **Hourly Rate Management** - Configurable hourly rate with persistence
 8. **Weekly Goal Tracking** - Set and track weekly hour targets with progress visualization
 9. **Daily Work Breakdown** - Detailed time entries per day with start/end times
10. **Today's Work Tracking** - Special handling for current day's work data
11. **Work Report Generation** - Copyable formatted report with date range and earnings
12. **Responsive Layout** - Dynamic horizontal/vertical layout based on screen dimensions
13. **Resizable Panels** - Draggable panel dividers for custom layout
14. **Chart Visualization** - Bar chart showing work hours with context-aware comparison (day-by-day for week view, week-by-week for month view, month-by-month for year view)
15. **Local Storage Persistence** - Saves short descriptions and currency rates
16. **Error Boundary** - Graceful error handling with retry mechanism
17. **Loading States** - Comprehensive loading skeletons for all components
18. **Remaining Days Calculator** - Shows days left in week and hours needed per day
19. **Extra Minutes Tracking** - Handles additional minutes beyond standard work entries
20. **Previous Week Hours Display** - Shows total worked hours from previous week
21. **Progress Percentage** - Visual progress bar showing weekly goal completion
22. **Target Hours Configuration** - Adjustable weekly hour target with API sync

### Current Tech Stack

* **Next.js 15.1.7** (App Router)
* **React 19.0.0**
* **Tailwind CSS 3.4.1**
* **shadcn/ui** (Radix UI primitives)
* **Recharts 2.15.1** - Bar chart visualization
* **Lucide React 0.475.0** - Icons
* **react-resizable-panels 2.1.7** - Draggable panels
* **date-fns 4.1.0** - Date manipulation
* **GSAP 3.12.7** - Animations

### Current Architecture Patterns

* **State Management**: React hooks with props drilling
* **Data Fetching**: Custom `useWorkData` hook with parallel fetching
* **API Integration**: Backend on port 88 with REST endpoints
* **Styling**: Tailwind utilities with CSS variables for theming
* **Error Handling**: ErrorBoundary component with retry mechanism
* **Caching**: localStorage for currency rate (1-hour TTL)

### Backend API Documentation

**Base URL**: `http://localhost:88`**Note**: Configure this via environment variable `VITE_API_BASE_URL`

#### Work Data Endpoints

**1. Get Work Data by Date Range**

```
GET /work-data?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

* **Description**: Fetch all work entries within a date range
* **Query Parameters**:
  * `startDate` (required): ISO date format (e.g., `2025-01-01`)
  * `endDate` (required): ISO date format (e.g., `2025-01-07`)
* **Response**: Array of work entries with date, start time, end time, duration
* **Example**: `/work-data?startDate=2025-01-01&endDate=2025-01-07`

**2. Get Today's Live Work Time**

```
GET /worktime
```

* **Description**: Get current day's work time (live/real-time)
* **Response**: Today's work hours and minutes
* **Use Case**: Display real-time work tracking for current day

**3. Get Work Time for Specific Dates**

```
GET /worktime?dates=DD-MM-YYYY,DD-MM-YYYY,...
```

* **Description**: Fetch work time for comma-separated dates
* **Query Parameters**:
  * `dates` (required): Comma-separated dates in DD-MM-YYYY format
* **Example**: `/worktime?dates=01-01-2025,02-01-2025`
* **Note**: Different date format than /work-data endpoint!

#### Settings Endpoints

**4. Get Hourly Rate**

```
GET /getHourlyRate
```

* **Description**: Retrieve user's configured hourly rate
* **Response**: Number (hourly rate value)
* **Default**: 0 if not set

**5. Set Hourly Rate**

```
POST /setHourlyRate?rate=X
```

* **Description**: Update user's hourly rate
* **Query Parameters**:
  * `rate` (required): Numeric value for hourly rate
* **Example**: `/setHourlyRate?rate=15.50`
* **Response**: Success confirmation

**6. Get Target Hours**

```
GET /getTargetHours
```

* **Description**: Retrieve weekly target hours goal
* **Response**: Number (target hours per week)
* **Default**: 40 if not set

**7. Set Target Hours**

```
POST /setTargetHours?hours=X
```

* **Description**: Update weekly target hours
* **Query Parameters**:
  * `hours` (required): Numeric value for weekly goal
* **Example**: `/setTargetHours?hours=40`
* **Response**: Success confirmation

### External API Documentation

**Currency Exchange Rate API**

```
GET http://www.geoplugin.net/json.gp
```

* **Description**: Fetch USD to BDT exchange rate
* **Response Format**: JSON with `geoplugin_currencyConverter` field
* **Caching**: Cache response for 1 hour in localStorage
* **Fallback**: Use default rate if API fails
* **Response Example**:

  ```json
  {
    "geoplugin_currencyCode": "USD",
    "geoplugin_currencyConverter": 110.50
  }
  ```

## Implementation Steps

### 1. Initialize SvelteKit Project

**Goal**: Set up a production-ready SvelteKit project from scratch with TypeScript and all dependencies

#### Step 1.1: Create Project

```bash
# Create new SvelteKit project with TypeScript
npm create svelte@latest work-report-svelte

# When prompted, select:
# - Skeleton project
# - TypeScript syntax: Yes
# - ESLint: Yes
# - Prettier: Yes
# - Playwright: Yes (for E2E tests)
# - Vitest: Yes (for unit tests)

cd work-report-svelte
npm install
```

#### Step 1.2: Install Dependencies

```bash
# Tailwind CSS and plugins
npx svelte-add@latest tailwindcss
npm install -D @tailwindcss/typography

# shadcn-svelte setup (interactive)
npx shadcn-svelte@latest init
# Choose: New York style, Neutral gray, CSS variables: Yes

# Install shadcn-svelte components we'll need
npx shadcn-svelte@latest add button card input label progress badge
npx shadcn-svelte@latest add resizable separator switch
npx shadcn-svelte@latest add sonner  # Toast notifications

# Chart library
npm install chart.js svelte-chartjs

# Date utilities
npm install date-fns

# Icons (Lucide Svelte)
npm install @lucide/svelte

# Animation library (optional, for advanced animations)
npm install svelte-motion

# For data export
npm install papaparse  # CSV export
npm install jspdf jspdf-autotable  # PDF export (optional for later)

# Type definitions
npm install -D @types/papaparse
```

#### Step 1.3: Configure Environment Variables

Create `.env` file:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:88
VITE_CURRENCY_API_URL=http://www.geoplugin.net/json.gp

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_PDF_EXPORT=false

# Default Values
VITE_DEFAULT_HOURLY_RATE=0
VITE_DEFAULT_TARGET_HOURS=40
```

Create `.env.example` (for documentation):

```env
VITE_API_BASE_URL=http://localhost:88
VITE_CURRENCY_API_URL=http://www.geoplugin.net/json.gp
```

#### Step 1.4: Project Structure

Create the following directory structure:

```
work-report-svelte/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Main dashboard page
│   │   ├── +layout.svelte            # Root layout with theme
│   │   ├── +layout.ts                # Layout load function
│   │   └── api/                      # API proxy routes
│   │       ├── work-data/
│   │       │   └── +server.ts        # Proxy work data endpoint
│   │       ├── hourly-rate/
│   │       │   └── +server.ts        # Proxy rate endpoints
│   │       ├── target-hours/
│   │       │   └── +server.ts        # Proxy target endpoints
│   │       └── currency/
│   │           └── +server.ts        # Proxy currency API
│   ├── lib/
│   │   ├── components/               # Svelte components
│   │   │   ├── Header.svelte
│   │   │   ├── FloatingReport.svelte
│   │   │   ├── WorkGoalTracker.svelte
│   │   │   ├── TimeReport.svelte
│   │   │   ├── ReportChart.svelte
│   │   │   ├── ErrorAlert.svelte
│   │   │   └── LoadingSkeleton.svelte
│   │   ├── stores/                   # Svelte stores
│   │   │   ├── workData.ts           # Work data state
│   │   │   ├── settings.ts           # Settings state
│   │   │   ├── ui.ts                 # UI state
│   │   │   └── index.ts              # Export all stores
│   │   ├── utils/                    # Utility functions
│   │   │   ├── dateUtils.ts          # Date calculations
│   │   │   ├── formatters.ts         # Format money, time
│   │   │   ├── calculations.ts       # Work hour calculations
│   │   │   └── api.ts                # API client utilities
│   │   ├── config/
│   │   │   └── index.ts              # App configuration
│   │   └── types/
│   │       └── index.ts              # TypeScript types
│   ├── app.html                      # HTML template
│   └── app.css                       # Global styles
├── static/                           # Static assets
├── .env                              # Environment variables
├── .env.example                      # Example env vars
├── svelte.config.js                  # SvelteKit config
├── vite.config.ts                    # Vite config
├── tailwind.config.ts                # Tailwind config
└── package.json
```

#### Step 1.5: Configure Tailwind Theme

Update `tailwind.config.ts` with custom theme:

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Your custom color palette
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... shadcn-svelte will add more
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
} satisfies Config;
```

#### Step 1.6: Create API Configuration

Create `src/lib/config/index.ts`:

```typescript
import { env } from '$env/dynamic/public';

export const config = {
  api: {
    baseUrl: env.VITE_API_BASE_URL || 'http://localhost:88',
    currencyUrl: env.VITE_CURRENCY_API_URL || 'http://www.geoplugin.net/json.gp'
  },
  defaults: {
    hourlyRate: Number(env.VITE_DEFAULT_HOURLY_RATE) || 0,
    targetHours: Number(env.VITE_DEFAULT_TARGET_HOURS) || 40
  },
  features: {
    darkMode: env.VITE_ENABLE_DARK_MODE === 'true',
    pdfExport: env.VITE_ENABLE_PDF_EXPORT === 'true'
  },
  cache: {
    currencyRateTTL: 60 * 60 * 1000 // 1 hour in milliseconds
  }
};
```

#### Step 1.7: Create TypeScript Types

Create `src/lib/types/index.ts`:

```typescript
// Work Entry Types
export interface WorkEntry {
  date: string; // ISO date format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  description?: string;
}

export interface WorkData {
  entries: WorkEntry[];
  totalHours: number;
  totalMinutes: number;
}

// API Response Types
export interface WorkDataResponse {
  workData: WorkEntry[];
}

export interface WorkTimeResponse {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

export interface HourlyRateResponse {
  rate: number;
}

export interface TargetHoursResponse {
  hours: number;
}

export interface CurrencyResponse {
  geoplugin_currencyCode: string;
  geoplugin_currencyConverter: number;
}

// Store State Types
export interface WorkDataState {
  currentWeek: WorkData; // Current period (week/month/year based on viewMode)
  previousWeek: WorkData; // Previous period (context-aware: previous week/month/year)
  todayWork: WorkTimeResponse | null;
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState {
  hourlyRate: number;
  targetHours: number;
  dollarRate: number;
  shortDescription: string;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  layoutDirection: 'horizontal' | 'vertical';
  viewMode: 'week' | 'month' | 'year';
  isRefreshing: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Date Range
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Chart Data
export interface ChartDataPoint {
  label: string;
  current: number;
  previous: number;
}
```

### 2. Create Svelte Stores

**Goal**: Implement centralized state management using Svelte stores with localStorage persistence and API integration

#### Step 2.1: Create Base Persisted Store Utility

Create `src/lib/stores/persisted.ts`:

```typescript
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Creates a Svelte writable store that persists to localStorage
 */
export function persisted<T>(key: string, initialValue: T): Writable<T> {
  // Get initial value from localStorage if in browser
  const stored = browser ? localStorage.getItem(key) : null;
  const data = stored ? JSON.parse(stored) : initialValue;

  // Create writable store
  const store = writable<T>(data);

  // Subscribe to store changes and persist to localStorage
  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}

/**
 * Creates a persisted store with TTL (time to live)
 */
export function persistedWithTTL<T>(
  key: string,
  initialValue: T,
  ttlMs: number
): Writable<T> {
  const stored = browser ? localStorage.getItem(key) : null;
  const timestampKey = `${key}_timestamp`;
  const timestamp = browser ? localStorage.getItem(timestampKey) : null;

  let data = initialValue;

  if (stored && timestamp) {
    const age = Date.now() - parseInt(timestamp, 10);
    if (age < ttlMs) {
      data = JSON.parse(stored);
    } else {
      // Clear expired data
      if (browser) {
        localStorage.removeItem(key);
        localStorage.removeItem(timestampKey);
      }
    }
  }

  const store = writable<T>(data);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
      localStorage.setItem(timestampKey, Date.now().toString());
    });
  }

  return store;
}
```

#### Step 2.2: Create Settings Store

Create `src/lib/stores/settings.ts`:

```typescript
import { derived, get } from 'svelte/store';
import { persisted, persistedWithTTL } from './persisted';
import { config } from '$lib/config';
import type { SettingsState } from '$lib/types';

// Individual persisted stores
export const hourlyRate = persisted<number>(
  'hourlyRate',
  config.defaults.hourlyRate
);

export const targetHours = persisted<number>(
  'targetHours',
  config.defaults.targetHours
);

export const dollarRate = persistedWithTTL<number>(
  'dollarRate',
  0,
  config.cache.currencyRateTTL
);

export const shortDescription = persisted<string>(
  'shortDescription',
  ''
);

// Derived store combining all settings
export const settings = derived(
  [hourlyRate, targetHours, dollarRate, shortDescription],
  ([$hourlyRate, $targetHours, $dollarRate, $shortDescription]) => ({
    hourlyRate: $hourlyRate,
    targetHours: $targetHours,
    dollarRate: $dollarRate,
    shortDescription: $shortDescription
  } as SettingsState)
);

// API sync functions
export async function syncHourlyRateFromAPI() {
  try {
    const response = await fetch('/api/hourly-rate');
    const data = await response.json();
    hourlyRate.set(data.rate);
  } catch (error) {
    console.error('Failed to sync hourly rate:', error);
  }
}

export async function updateHourlyRate(rate: number) {
  try {
    const response = await fetch(`/api/hourly-rate?rate=${rate}`, {
      method: 'POST'
    });
    if (response.ok) {
      hourlyRate.set(rate);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update hourly rate:', error);
    return false;
  }
}

export async function syncTargetHoursFromAPI() {
  try {
    const response = await fetch('/api/target-hours');
    const data = await response.json();
    targetHours.set(data.hours);
  } catch (error) {
    console.error('Failed to sync target hours:', error);
  }
}

export async function updateTargetHours(hours: number) {
  try {
    const response = await fetch(`/api/target-hours?hours=${hours}`, {
      method: 'POST'
    });
    if (response.ok) {
      targetHours.set(hours);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update target hours:', error);
    return false;
  }
}

export async function fetchCurrencyRate() {
  const currentRate = get(dollarRate);
  
  // Return cached rate if valid
  if (currentRate > 0) {
    return currentRate;
  }

  try {
    const response = await fetch('/api/currency');
    const data = await response.json();
    const rate = data.geoplugin_currencyConverter || 0;
    dollarRate.set(rate);
    return rate;
  } catch (error) {
    console.error('Failed to fetch currency rate:', error);
    return 0;
  }
}
```

#### Step 2.3: Create Work Data Store

**Important**: This store implements context-aware comparison. When viewing by week, it compares with the previous week; when viewing by month, it compares with the previous month; when viewing by year, it compares with the previous year.

Create `src/lib/stores/workData.ts`:

```typescript
import { writable, derived, get } from 'svelte/store';
import { format, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, isToday } from 'date-fns';
import type { WorkData, WorkDataState, DateRange, WorkEntry } from '$lib/types';

// View mode for determining comparison context
export const viewMode = writable<'week' | 'month' | 'year'>('week');

// Current date range (will be calculated based on view mode)
export const dateRange = writable<DateRange>({
  startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  endDate: endOfWeek(new Date(), { weekStartsOn: 1 }) // Sunday
});

// Work data state
export const workDataState = writable<WorkDataState>({
  currentWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
  previousWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
  todayWork: null,
  isLoading: false,
  error: null
});

// Derived stores for easy access
export const currentWeekData = derived(
  workDataState,
  ($state) => $state.currentWeek
);

export const previousWeekData = derived(
  workDataState,
  ($state) => $state.previousWeek
);

export const isLoading = derived(
  workDataState,
  ($state) => $state.isLoading
);

export const error = derived(
  workDataState,
  ($state) => $state.error
);

// Helper function to calculate totals from entries
function calculateTotals(entries: WorkEntry[]): WorkData {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
  return {
    entries,
    totalHours: Math.floor(totalMinutes / 60),
    totalMinutes: totalMinutes % 60
  };
}

// Fetch work data for a date range
export async function fetchWorkData(start: Date, end: Date): Promise<WorkData> {
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  try {
    const response = await fetch(
      `/api/work-data?startDate=${startStr}&endDate=${endStr}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch work data');
    }

    const data = await response.json();
    return calculateTotals(data.workData || []);
  } catch (error) {
    console.error('Error fetching work data:', error);
    throw error;
  }
}

// Fetch today's live work time
export async function fetchTodayWork() {
  try {
    const response = await fetch('/api/work-data/today');
    
    if (!response.ok) {
      throw new Error('Failed to fetch today work');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching today work:', error);
    return null;
  }
}

// Main function to load all work data
export async function loadWorkData() {
  const range = get(dateRange);
  const mode = get(viewMode);
  
  workDataState.update((state) => ({
    ...state,
    isLoading: true,
    error: null
  }));

  try {
    // Calculate previous period range based on view mode
    let prevStart: Date;
    let prevEnd: Date;
    
    if (mode === 'week') {
      prevStart = startOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
      prevEnd = endOfWeek(subWeeks(range.endDate, 1), { weekStartsOn: 1 });
    } else if (mode === 'month') {
      prevStart = startOfMonth(subMonths(range.startDate, 1));
      prevEnd = endOfMonth(subMonths(range.endDate, 1));
    } else { // year
      prevStart = startOfYear(subYears(range.startDate, 1));
      prevEnd = endOfYear(subYears(range.endDate, 1));
    }

    // Fetch current and previous period data in parallel
    const [currentWeek, previousWeek] = await Promise.all([
      fetchWorkData(range.startDate, range.endDate),
      fetchWorkData(prevStart, prevEnd)
    ]);

    // Fetch today's work if current week includes today
    let todayWork = null;
    if (isToday(range.startDate) || (range.startDate <= new Date() && range.endDate >= new Date())) {
      todayWork = await fetchTodayWork();
    }

    workDataState.set({
      currentWeek,
      previousWeek,
      todayWork,
      isLoading: false,
      error: null
    });
  } catch (error) {
    workDataState.update((state) => ({
      ...state,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}

// Navigate to next period (context-aware based on view mode)
export function nextPeriod() {
  const mode = get(viewMode);
  
  dateRange.update((range) => {
    if (mode === 'week') {
      return {
        startDate: new Date(range.startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(range.endDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    } else if (mode === 'month') {
      const nextStart = new Date(range.startDate);
      nextStart.setMonth(nextStart.getMonth() + 1);
      return {
        startDate: startOfMonth(nextStart),
        endDate: endOfMonth(nextStart)
      };
    } else { // year
      const nextStart = new Date(range.startDate);
      nextStart.setFullYear(nextStart.getFullYear() + 1);
      return {
        startDate: startOfYear(nextStart),
        endDate: endOfYear(nextStart)
      };
    }
  });
  loadWorkData();
}

// Navigate to previous period (context-aware based on view mode)
export function previousPeriod() {
  const mode = get(viewMode);
  
  dateRange.update((range) => {
    if (mode === 'week') {
      return {
        startDate: new Date(range.startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(range.endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      };
    } else if (mode === 'month') {
      const prevStart = new Date(range.startDate);
      prevStart.setMonth(prevStart.getMonth() - 1);
      return {
        startDate: startOfMonth(prevStart),
        endDate: endOfMonth(prevStart)
      };
    } else { // year
      const prevStart = new Date(range.startDate);
      prevStart.setFullYear(prevStart.getFullYear() - 1);
      return {
        startDate: startOfYear(prevStart),
        endDate: endOfYear(prevStart)
      };
    }
  });
  loadWorkData();
}

// Legacy function names for backward compatibility
export const nextWeek = nextPeriod;
export const previousWeek = previousPeriod;

// Refresh current data
export function refreshWorkData() {
  return loadWorkData();
}
```

#### Step 2.4: Create UI Store

Create `src/lib/stores/ui.ts`:

```typescript
import { writable, derived } from 'svelte/store';
import { persisted } from './persisted';
import type { UIState, Notification } from '$lib/types';
import { browser } from '$app/environment';

// Theme store with system preference detection
function createThemeStore() {
  const stored = persisted<'light' | 'dark' | 'system'>('theme', 'system');
  
  // Detect system preference
  const systemTheme = derived(stored, ($theme) => {
    if (!browser) return 'light';
    
    if ($theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return $theme;
  });

  return {
    subscribe: stored.subscribe,
    set: stored.set,
    update: stored.update,
    systemTheme
  };
}

export const theme = createThemeStore();

// Layout direction (responsive)
export const layoutDirection = writable<'horizontal' | 'vertical'>('horizontal');

// Loading/refreshing state
export const isRefreshing = writable<boolean>(false);

// Notifications
export const notifications = writable<Notification[]>([]);

// Helper functions for notifications
export function addNotification(
  type: Notification['type'],
  message: string,
  duration = 3000
) {
  const id = Date.now().toString();
  const notification: Notification = { id, type, message, duration };
  
  notifications.update((n) => [...n, notification]);

  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
}

export function removeNotification(id: string) {
  notifications.update((n) => n.filter((notification) => notification.id !== id));
}

export function clearNotifications() {
  notifications.set([]);
}

// Combined UI state
export const uiState = derived(
  [theme, layoutDirection, isRefreshing, notifications],
  ([$theme, $layout, $refreshing, $notifications]) => ({
    theme: $theme,
    layoutDirection: $layout,
    isRefreshing: $refreshing,
    notifications: $notifications
  } as UIState)
);
```

#### Step 2.5: Export All Stores

Create `src/lib/stores/index.ts`:

```typescript
// Re-export all stores for easy imports
export * from './workData';
export * from './settings';
export * from './ui';
export * from './persisted';
```

**Key Advantages of This Store Architecture**:

* ✅ No props drilling - access state from any component
* ✅ Built-in reactivity with `$:` statements
* ✅ Automatic localStorage persistence with TTL support
* ✅ Type-safe with TypeScript
* ✅ Derived stores for computed values
* ✅ Clean API sync functions
* ✅ Centralized state management

### 3. Create API Proxy Routes

**Goal**: Set up SvelteKit API routes to proxy requests to the backend server (port 88) and external APIs

#### Step 3.1: Create Work Data API Route

Create `src/routes/api/work-data/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/work-data?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Proxy to backend: GET /work-data?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  if (!startDate || !endDate) {
    throw error(400, 'startDate and endDate are required');
  }

  try {
    const response = await fetch(
      `${config.api.baseUrl}/work-data?startDate=${startDate}&endDate=${endDate}`
    );

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch work data from backend');
    }

    const data = await response.json();
    return json({ workData: data });
  } catch (err) {
    console.error('Error proxying work-data:', err);
    throw error(500, 'Internal server error');
  }
};
```

Create `src/routes/api/work-data/today/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/work-data/today
 * Proxy to backend: GET /worktime
 */
export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const response = await fetch(`${config.api.baseUrl}/worktime`);

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch today work time');
    }

    const data = await response.json();
    return json(data);
  } catch (err) {
    console.error('Error proxying today worktime:', err);
    throw error(500, 'Internal server error');
  }
};
```

#### Step 3.2: Create Hourly Rate API Route

Create `src/routes/api/hourly-rate/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/hourly-rate
 * Proxy to backend: GET /getHourlyRate
 */
export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const response = await fetch(`${config.api.baseUrl}/getHourlyRate`);

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch hourly rate');
    }

    const data = await response.text();
    const rate = parseFloat(data) || config.defaults.hourlyRate;
    
    return json({ rate });
  } catch (err) {
    console.error('Error fetching hourly rate:', err);
    return json({ rate: config.defaults.hourlyRate });
  }
};

/**
 * POST /api/hourly-rate?rate=X
 * Proxy to backend: POST /setHourlyRate?rate=X
 */
export const POST: RequestHandler = async ({ url, fetch }) => {
  const rate = url.searchParams.get('rate');

  if (!rate || isNaN(parseFloat(rate))) {
    throw error(400, 'Valid rate parameter is required');
  }

  try {
    const response = await fetch(
      `${config.api.baseUrl}/setHourlyRate?rate=${rate}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw error(response.status, 'Failed to update hourly rate');
    }

    return json({ success: true, rate: parseFloat(rate) });
  } catch (err) {
    console.error('Error updating hourly rate:', err);
    throw error(500, 'Internal server error');
  }
};
```

#### Step 3.3: Create Target Hours API Route

Create `src/routes/api/target-hours/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/target-hours
 * Proxy to backend: GET /getTargetHours
 */
export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const response = await fetch(`${config.api.baseUrl}/getTargetHours`);

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch target hours');
    }

    const data = await response.text();
    const hours = parseFloat(data) || config.defaults.targetHours;
    
    return json({ hours });
  } catch (err) {
    console.error('Error fetching target hours:', err);
    return json({ hours: config.defaults.targetHours });
  }
};

/**
 * POST /api/target-hours?hours=X
 * Proxy to backend: POST /setTargetHours?hours=X
 */
export const POST: RequestHandler = async ({ url, fetch }) => {
  const hours = url.searchParams.get('hours');

  if (!hours || isNaN(parseFloat(hours))) {
    throw error(400, 'Valid hours parameter is required');
  }

  try {
    const response = await fetch(
      `${config.api.baseUrl}/setTargetHours?hours=${hours}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw error(response.status, 'Failed to update target hours');
    }

    return json({ success: true, hours: parseFloat(hours) });
  } catch (err) {
    console.error('Error updating target hours:', err);
    throw error(500, 'Internal server error');
  }
};
```

#### Step 3.4: Create Currency API Route

Create `src/routes/api/currency/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/currency
 * Proxy to external API: GET http://www.geoplugin.net/json.gp
 * Returns USD to BDT exchange rate
 */
export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const response = await fetch(config.api.currencyUrl);

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch currency rate');
    }

    const data = await response.json();
    
    return json({
      geoplugin_currencyCode: data.geoplugin_currencyCode || 'USD',
      geoplugin_currencyConverter: data.geoplugin_currencyConverter || 0
    });
  } catch (err) {
    console.error('Error fetching currency rate:', err);
    // Return fallback rate
    return json({
      geoplugin_currencyCode: 'USD',
      geoplugin_currencyConverter: 110 // Fallback BDT rate
    });
  }
};
```

#### Step 3.5: Test API Routes

Create a simple test script or use browser:

```bash
# Start dev server
npm run dev

# Test endpoints (in another terminal or browser)
curl "http://localhost:5173/api/work-data?startDate=2025-01-01&endDate=2025-01-07"
curl "http://localhost:5173/api/hourly-rate"
curl "http://localhost:5173/api/target-hours"
curl "http://localhost:5173/api/currency"
```

### 4. Build Core Layout Components

**Goal**: Create all UI components with modern Svelte syntax and shadcn-svelte

#### Step 4.1: Create Utility Functions

First, create helper utilities that components will use.

Create `src/lib/utils/formatters.ts`:

```typescript
/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'BDT'): string {
  return `${currency} ${value.toFixed(2)}`;
}

/**
 * Format time as "Xh Ym"
 */
export function formatTime(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return '0h 0m';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Format date range
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
}
```

Create `src/lib/utils/calculations.ts`:

```typescript
import { differenceInDays, endOfWeek, isWeekend } from 'date-fns';

/**
 * Calculate remaining working days in current week
 */
export function getRemainingDays(startDate: Date): number {
  const today = new Date();
  const weekEnd = endOfWeek(startDate, { weekStartsOn: 1 });
  
  let remainingDays = 0;
  let current = today;
  
  while (current <= weekEnd) {
    if (!isWeekend(current)) {
      remainingDays++;
    }
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return remainingDays;
}

/**
 * Calculate hours needed per remaining day
 */
export function getHoursNeededPerDay(
  targetHours: number,
  workedHours: number,
  remainingDays: number
): number {
  const hoursLeft = targetHours - workedHours;
  if (hoursLeft <= 0 || remainingDays === 0) return 0;
  return hoursLeft / remainingDays;
}

/**
 * Calculate goal completion percentage
 */
export function getGoalPercentage(
  workedHours: number,
  targetHours: number
): number {
  if (targetHours === 0) return 0;
  return Math.min((workedHours / targetHours) * 100, 100);
}
```

#### Step 4.2: Create Header Component

Create `src/lib/components/Header.svelte`:

```svelte
<script lang="ts">
  import { dateRange, previousWeek, nextWeek, refreshWorkData } from '$lib/stores';
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft, ChevronRight, RefreshCw, Moon, Sun } from '@lucide/svelte';
  import { theme } from '$lib/stores/ui';
  import { format } from 'date-fns';
  import { fade } from 'svelte/transition';

  let isRefreshing = false;

  async function handleRefresh() {
    isRefreshing = true;
    await refreshWorkData();
    setTimeout(() => {
      isRefreshing = false;
    }, 1000);
  }

  function toggleTheme() {
    theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  $: dateRangeText = `${format($dateRange.startDate, 'MMM dd')} - ${format(
    $dateRange.endDate,
    'MMM dd, yyyy'
  )}`;
</script>

<header class="flex items-center justify-between p-4 border-b bg-background">
  <div class="flex items-center gap-4">
    <h1 class="text-2xl font-bold">Work Report</h1>
    <Button variant="outline" size="icon" on:click={toggleTheme}>
      {#if $theme === 'dark'}
        <Sun class="h-4 w-4" />
      {:else}
        <Moon class="h-4 w-4" />
      {/if}
    </Button>
  </div>

  <div class="flex items-center gap-2">
    <Button variant="outline" size="icon" on:click={previousWeek}>
      <ChevronLeft class="h-4 w-4" />
    </Button>
    
    <span class="text-sm font-medium px-4">{dateRangeText}</span>
    
    <Button variant="outline" size="icon" on:click={nextWeek}>
      <ChevronRight class="h-4 w-4" />
    </Button>
    
    <Button
      variant="outline"
      size="icon"
      on:click={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw class="h-4 w-4" class:animate-spin={isRefreshing} />
    </Button>
  </div>
</header>
```

#### Step 4.3: Create FloatingReport Component

Create `src/lib/components/FloatingReport.svelte`:

```svelte
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Copy, X, Download } from '@lucide/svelte';
  import { currentWeekData, dateRange } from '$lib/stores';
  import { dollarRate, shortDescription } from '$lib/stores/settings';
  import { addNotification } from '$lib/stores/ui';
  import { formatCurrency, formatTime } from '$lib/utils/formatters';
  import { format } from 'date-fns';

  export let hourlyRate: number;

  $: totalHours = $currentWeekData.totalHours;
  $: totalMinutes = $currentWeekData.totalMinutes;
  $: totalDecimalHours = totalHours + totalMinutes / 60;
  $: totalIncome = totalDecimalHours * hourlyRate;
  $: totalIncomeUSD = $dollarRate > 0 ? totalIncome / $dollarRate : 0;

  function copyReport() {
    const report = `Work Report\n\n` +
      `Period: ${format($dateRange.startDate, 'MMM dd')} - ${format($dateRange.endDate, 'MMM dd, yyyy')}\n` +
      `Description: ${$shortDescription}\n\n` +
      `Total Hours: ${formatTime(totalHours, totalMinutes)}\n` +
      `Hourly Rate: ${hourlyRate}\n` +
      `Total Income: ${formatCurrency(totalIncome)} (${formatCurrency(totalIncomeUSD, 'USD')})`;

    navigator.clipboard.writeText(report);
    addNotification('success', 'Report copied to clipboard!');
  }
</script>

<Card class="p-6 space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold">Work Report</h2>
    <Button variant="ghost" size="icon">
      <X class="h-4 w-4" />
    </Button>
  </div>

  <div class="space-y-2">
    <Label for="description">Description</Label>
    <Input
      id="description"
      bind:value={$shortDescription}
      placeholder="Brief description of work..."
    />
  </div>

  <div class="space-y-2">
    <div class="flex justify-between text-sm">
      <span class="text-muted-foreground">Dollar Rate:</span>
      <span class="font-medium">{$dollarRate.toFixed(2)} BDT</span>
    </div>
    
    <div class="flex justify-between text-sm">
      <span class="text-muted-foreground">Total Hours:</span>
      <span class="font-medium">{formatTime(totalHours, totalMinutes)}</span>
    </div>
    
    <div class="flex justify-between">
      <span class="text-muted-foreground">Income:</span>
      <div class="text-right">
        <div class="font-semibold">{formatCurrency(totalIncome)}</div>
        <div class="text-sm text-muted-foreground">
          {formatCurrency(totalIncomeUSD, 'USD')}
        </div>
      </div>
    </div>
  </div>

  <div class="flex gap-2">
    <Button class="flex-1" on:click={copyReport}>
      <Copy class="h-4 w-4 mr-2" />
      Copy Report
    </Button>
    <Button variant="outline">
      <Download class="h-4 w-4 mr-2" />
      Export
    </Button>
  </div>
</Card>
```

#### Step 4.4: Create WorkGoalTracker Component

Create `src/lib/components/WorkGoalTracker.svelte`:

```svelte
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Progress } from '$lib/components/ui/progress';
  import { Badge } from '$lib/components/ui/badge';
  import { currentWeekData, previousWeekData, dateRange } from '$lib/stores';
  import { targetHours, updateTargetHours } from '$lib/stores/settings';
  import { getRemainingDays, getHoursNeededPerDay, getGoalPercentage } from '$lib/utils/calculations';
  import { formatTime } from '$lib/utils/formatters';

  let targetInput = $targetHours;
  let debounceTimer: NodeJS.Timeout;

  function handleTargetChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateTargetHours(targetInput);
    }, 500);
  }

  $: workedHours = $currentWeekData.totalHours + $currentWeekData.totalMinutes / 60;
  $: prevWeekHours = $previousWeekData.totalHours + $previousWeekData.totalMinutes / 60; // Previous period hours (context-aware)
  $: remainingDays = getRemainingDays($dateRange.startDate);
  $: hoursPerDay = getHoursNeededPerDay($targetHours, workedHours, remainingDays);
  $: progress = getGoalPercentage(workedHours, $targetHours);
  $: hoursLeft = Math.max($targetHours - workedHours, 0);
</script>

<Card class="p-6 space-y-6">
  <div>
    <h2 class="text-lg font-semibold mb-4">Weekly Goal</h2>
    
    <div class="space-y-2 mb-4">
      <Label for="target">Target Hours</Label>
      <Input
        id="target"
        type="number"
        bind:value={targetInput}
        on:input={handleTargetChange}
        min="0"
        step="1"
      />
    </div>

    <Progress value={progress} class="h-2 mb-2" />
    <div class="flex justify-between text-sm text-muted-foreground">
      <span>{progress.toFixed(0)}% Complete</span>
      <span>{formatTime(Math.floor(workedHours), Math.round((workedHours % 1) * 60))}</span>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="space-y-1">
      <div class="text-sm text-muted-foreground">Hours Left</div>
      <div class="text-2xl font-bold">{hoursLeft.toFixed(1)}h</div>
    </div>
    
    <div class="space-y-1">
      <div class="text-sm text-muted-foreground">Per Day</div>
      <div class="text-2xl font-bold">{hoursPerDay.toFixed(1)}h</div>
    </div>
    
    <div class="space-y-1">
      <div class="text-sm text-muted-foreground">Days Left</div>
      <div class="text-2xl font-bold">{remainingDays}</div>
    </div>
    
    <div class="space-y-1">
      <div class="text-sm text-muted-foreground">Last Week</div>
      <div class="text-2xl font-bold">{prevWeekHours.toFixed(1)}h</div>
    </div>
  </div>

  {#if progress >= 100}
    <Badge variant="success" class="w-full justify-center py-2">
      🎉 Goal Achieved!
    </Badge>
  {/if}
</Card>
```

#### Step 4.5: Create TimeReport Component

Create `src/lib/components/TimeReport.svelte`:

```svelte
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { currentWeekData } from '$lib/stores';
  import { format, isToday, parseISO } from 'date-fns';
  import type { WorkEntry } from '$lib/types';

  // Group entries by date
  $: groupedEntries = $currentWeekData.entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, WorkEntry[]>);

  function getDailyTotal(entries: WorkEntry[]): number {
    return entries.reduce((sum, entry) => sum + entry.duration, 0);
  }
</script>

<Card class="p-6 space-y-4">
  <h2 class="text-lg font-semibold">Daily Breakdown</h2>

  <div class="space-y-3">
    {#each Object.entries(groupedEntries) as [date, entries]}
      {@const dailyTotal = getDailyTotal(entries)}
      {@const dateObj = parseISO(date)}
      {@const isDateToday = isToday(dateObj)}
      
      <div class="border rounded-lg p-4 {isDateToday ? 'border-primary' : ''}">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="font-medium">{format(dateObj, 'EEE, MMM dd')}</span>
            {#if isDateToday}
              <Badge variant="default">Today</Badge>
            {/if}
          </div>
          <span class="text-sm font-medium">
            {Math.floor(dailyTotal / 60)}h {dailyTotal % 60}m
          </span>
        </div>

        <div class="space-y-1">
          {#each entries as entry}
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>{entry.startTime} - {entry.endTime}</span>
              <span>{entry.duration}m</span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center py-8 text-muted-foreground">
        No work entries for this week
      </div>
    {/each}
  </div>
</Card>
```

#### Step 4.6: Create Shared Components

Create `src/lib/components/LoadingSkeleton.svelte`:

```svelte
<script lang="ts">
  export let className = '';
</script>

<div class="animate-pulse space-y-4 {className}">
  <div class="h-4 bg-muted rounded w-3/4"></div>
  <div class="h-4 bg-muted rounded w-1/2"></div>
  <div class="h-4 bg-muted rounded w-5/6"></div>
</div>
```

Create `src/lib/components/ErrorAlert.svelte`:

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { AlertCircle } from '@lucide/svelte';

  export let message: string;
  export let onRetry: (() => void) | undefined = undefined;
</script>

<div class="border border-destructive/50 rounded-lg p-4 bg-destructive/10">
  <div class="flex items-start gap-3">
    <AlertCircle class="h-5 w-5 text-destructive mt-0.5" />
    <div class="flex-1">
      <h3 class="font-semibold text-destructive">Error</h3>
      <p class="text-sm text-muted-foreground mt-1">{message}</p>
      {#if onRetry}
        <Button variant="outline" size="sm" class="mt-3" on:click={onRetry}>
          Try Again
        </Button>
      {/if}
    </div>
  </div>
</div>
```

### 5. Implement Enhanced Chart System

**Goal**: Create a comprehensive chart component with Week/Month/Year views

#### Step 5.1: Create Chart Component

Create `src/lib/components/ReportChart.svelte`:

**Week View**:

* Bar chart: 7 days (Mon-Sun)
* Compares current week vs previous week (day-by-day)
* Daily hours comparison
* Hover tooltips with detailed breakdown
* Example: Current week Mon = 8h, Previous week Mon = 7h

**Month View** (new):

* Bar chart: 4-5 weeks in the month
* Compares current month vs previous month (week-by-week)
* Grouped by weeks (Week 1, Week 2, etc.)
* Trend line overlay showing progression
* Month-over-month comparison
* Example: Current month Week 1 = 40h, Previous month Week 1 = 35h

**Year View** (new):

* Bar chart: 12 months (Jan-Dec)
* Compares current year vs previous year (month-by-month)
* Monthly totals aggregated
* Quarterly aggregations as secondary view
* Year-over-year growth indicators
* Example: Current year Jan = 160h, Previous year Jan = 150h

**Key Design Principle**: The "previous" comparison data always matches the granularity of the current view:
- Week view → Previous week (same days)
- Month view → Previous month (same weeks)
- Year view → Previous year (same months)

**Chart Improvements**:

* Smooth transitions between view modes (Svelte fade/scale)
* Interactive legend with toggle series
* Zoom/pan functionality for large datasets
* Export chart as image
* Customizable color themes synced with dark mode
* Responsive chart sizing

**Implementation Options**:

* **Chart.js**: Lightweight, simple API (\~200KB)
* **Apache ECharts**: Feature-rich, better for complex visualizations (\~900KB)
* **LayerChart**: Svelte-native, but less mature

**Recommendation**: Start with Chart.js, evaluate ECharts if advanced features needed

#### Step 5.2: Implement Chart Data Processing

Add chart-specific utilities in `src/lib/utils/chartHelpers.ts`:

```typescript
import { eachDayOfInterval, format, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';\nimport type { WorkEntry, ChartDataPoint } from '$lib/types';\n\n/**\n * Process weekly data for chart\n */\nexport function prepareWeeklyChartData(\n  currentWeek: WorkEntry[],\n  previousWeek: WorkEntry[]\n): ChartDataPoint[] {\n  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];\n  \n  return days.map((day, index) => {\n    const currentDayData = currentWeek.filter(\n      (entry) => new Date(entry.date).getDay() === (index + 1) % 7\n    );\n    const prevDayData = previousWeek.filter(\n      (entry) => new Date(entry.date).getDay() === (index + 1) % 7\n    );\n    \n    const currentTotal = currentDayData.reduce((sum, e) => sum + e.duration, 0) / 60;\n    const prevTotal = prevDayData.reduce((sum, e) => sum + e.duration, 0) / 60;\n    \n    return {\n      label: day,\n      current: Number(currentTotal.toFixed(2)),\n      previous: Number(prevTotal.toFixed(2))\n    };\n  });\n}\n```\n\nRefer to Step 4 in the original plan for Month/Year view implementations.\n\n### 6. Create Main Dashboard Page\n\n**Goal**: Assemble all components into the main application\n\n#### Step 6.1: Create Layout\n\nCreate `src/routes/+layout.svelte`:\n\n```svelte\n<script lang=\"ts\">\n  import '../app.css';\n  import { theme } from '$lib/stores/ui';\n  import { Toaster } from '$lib/components/ui/sonner';\n  import { onMount } from 'svelte';\n\n  onMount(() => {\n    // Apply theme to document\n    if ($theme.systemTheme === 'dark') {\n      document.documentElement.classList.add('dark');\n    } else {\n      document.documentElement.classList.remove('dark');\n    }\n  });\n\n  // Watch for theme changes\n  $: {\n    if (typeof document !== 'undefined') {\n      if ($theme.systemTheme === 'dark') {\n        document.documentElement.classList.add('dark');\n      } else {\n        document.documentElement.classList.remove('dark');\n      }\n    }\n  }\n</script>\n\n<slot />\n<Toaster />\n```\n\n#### Step 6.2: Create Main Page\n\nCreate `src/routes/+page.svelte`:\n\n```svelte\n<script lang=\"ts\">\n  import { onMount } from 'svelte';\n  import { loadWorkData, isLoading, error } from '$lib/stores';\n  import { syncHourlyRateFromAPI, syncTargetHoursFromAPI, fetchCurrencyRate } from '$lib/stores/settings';\n  import { hourlyRate } from '$lib/stores/settings';\n  \n  import Header from '$lib/components/Header.svelte';\n  import FloatingReport from '$lib/components/FloatingReport.svelte';\n  import WorkGoalTracker from '$lib/components/WorkGoalTracker.svelte';\n  import TimeReport from '$lib/components/TimeReport.svelte';\n  import ReportChart from '$lib/components/ReportChart.svelte';\n  import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';\n  import ErrorAlert from '$lib/components/ErrorAlert.svelte';\n  \n  import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '$lib/components/ui/resizable';\n\n  onMount(async () => {\n    // Load initial data\n    await Promise.all([\n      loadWorkData(),\n      syncHourlyRateFromAPI(),\n      syncTargetHoursFromAPI(),\n      fetchCurrencyRate()\n    ]);\n  });\n\n  // Keyboard shortcuts\n  function handleKeydown(event: KeyboardEvent) {\n    if (event.key === 'r' && !event.ctrlKey && !event.metaKey) {\n      event.preventDefault();\n      loadWorkData();\n    }\n    // Add more shortcuts as needed\n  }\n</script>\n\n<svelte:window on:keydown={handleKeydown} />\n\n<div class=\"min-h-screen bg-background\">\n  <Header />\n  \n  <main class=\"container mx-auto p-4\">\n    {#if $error}\n      <ErrorAlert message={$error} onRetry={loadWorkData} />\n    {:else if $isLoading}\n      <div class=\"grid gap-4 md:grid-cols-3\">\n        <LoadingSkeleton />\n        <LoadingSkeleton />\n        <LoadingSkeleton />\n      </div>\n    {:else}\n      <ResizablePanelGroup direction=\"horizontal\" class=\"gap-4\">\n        <ResizablePanel defaultSize={25} minSize={20}>\n          <div class=\"space-y-4\">\n            <FloatingReport hourlyRate={$hourlyRate} />\n          </div>\n        </ResizablePanel>\n        \n        <ResizableHandle />\n        \n        <ResizablePanel defaultSize={40}>\n          <ReportChart />\n        </ResizablePanel>\n        \n        <ResizableHandle />\n        \n        <ResizablePanel defaultSize={35}>\n          <div class=\"space-y-4\">\n            <WorkGoalTracker />\n            <TimeReport />\n          </div>\n        </ResizablePanel>\n      </ResizablePanelGroup>\n    {/if}\n  </main>\n</div>\n```\n\n### 7. Add New Features

**Goal**: Enhance functionality beyond current application

**Dark Mode**:

* Toggle in header with system preference detection
* Persist preference in localStorage
* Smooth theme transitions
* Chart color palette adapts to theme
* Custom Tailwind dark mode classes

**Data Export**:

* **CSV Export**:
  * Weekly/monthly/yearly work logs
  * Financial summary
  * Time entries with date ranges
* **PDF Export**:
  * Professional report template
  * Company branding support
  * Charts embedded as images
  * Use jsPDF or Puppeteer

**Keyboard Shortcuts**:

* `n` - Next period (week/month/year based on current view)
* `p` - Previous period (week/month/year based on current view)
* `r` - Refresh data
* `t` - Toggle theme
* `e` - Export current view
* `?` - Show shortcuts modal
* `w`/`m`/`y` - Switch to Week/Month/Year view
* Implement with Svelte actions

**Notification System**:

* Toast notifications for:
  * Goal achievements (50%, 75%, 100%)
  * Data sync success/failure
  * Export completion
  * Clipboard copy confirmation
* Use shadcn-svelte Sonner or custom toast component

**Historical Comparison**:

* Date picker to select any two periods
* Compare any week/month/year
* Visual diff highlighting improvements/declines
* Percentage change indicators
* Best/worst performance metrics

**Additional Features to Consider**:

* Weekly summary emails (requires backend)
* Time tracking timer integration (start/stop work)
* Multi-currency support beyond BDT/USD
* Invoice generation from work reports
* Analytics dashboard (streaks, averages, trends)
* Work categories/tags for detailed tracking
* Break time tracking
* Overtime alerts

### 8. Polish UI and Deploy

**Goal**: Production-ready application with optimal performance

**UI Polish**:

* Implement Svelte page transitions (fade, slide, scale)
* Add loading skeletons for all async content
* Micro-animations for:
  * Button clicks (ripple effect)
  * Number counting (increment animation)
  * Progress bar fills
  * Chart data updates
* Mobile-first responsive design:
  * Touch-optimized controls
  * Swipe gestures for week navigation
  * Collapsible panels on small screens
  * Bottom sheet for mobile settings
* Accessibility improvements:
  * ARIA labels
  * Keyboard navigation
  * Screen reader announcements
  * Focus management

**Performance Optimization**:

* Code splitting with SvelteKit dynamic imports
* Image optimization (if adding logos/branding)
* Bundle size analysis
* Lazy load chart library
* Debounce API calls
* Virtual scrolling for long lists

**PWA Support** (Optional):

* Service worker for offline capability
* Cache work data for offline viewing
* Background sync when connection restored
* Add to home screen prompt
* Push notifications for goals

**Deployment Options**:

* **Vercel**: Zero-config deployment with SvelteKit adapter
* **Netlify**: Similar ease, supports SvelteKit
* **Cloudflare Pages**: Edge deployment for global performance
* **Self-hosted**: Node adapter with PM2/Docker

**Testing**:

* Unit tests with Vitest
* Component tests with Testing Library
* E2E tests with Playwright
* Accessibility testing with axe-core

## Technology Decisions

### Component Library

**Recommendation**: shadcn-svelte (Bits UI)

**Pros**:

* Similar to current shadcn/ui (familiar patterns)
* Copy-paste components, full ownership
* Headless UI with Bits UI primitives
* Tailwind-first styling
* Growing ecosystem

**Alternatives**:

* **Skeleton UI**: More opinionated, batteries-included
* **Flowbite Svelte**: Bootstrap-like, extensive components
* **Melt UI**: Headless only, maximum flexibility

### Chart Library

**Recommendation**: Chart.js with svelte-chartjs wrapper

**Pros**:

* Lightweight (\~200KB minified)
* Excellent documentation
* Simple API, quick to implement
* Good enough for current needs
* Wide browser support

**When to use ECharts**:

* Need advanced interactions (brush selection, data zoom)
* Complex multi-axis charts
* Geographic visualizations
* Real-time streaming data
* Worth the 900KB+ bundle size

### State Management

**Recommendation**: Svelte writable stores with manual localStorage sync

**Approach**:

```typescript
// Simple writable store with localStorage
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export function persistedStore<T>(key: string, initial: T) {
  const stored = browser ? localStorage.getItem(key) : null;
  const data = stored ? JSON.parse(stored) : initial;
  const store = writable<T>(data);
  
  store.subscribe(value => {
    if (browser) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
  
  return store;
}
```

**Alternative**: Use `svelte-persisted-store` library if pattern becomes repetitive

### API Strategy

**Recommendation**: Proxy existing backend through SvelteKit API routes

**Approach**:

```typescript
// src/routes/api/work-data/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  
  const response = await fetch(
    `http://localhost:88/work-data?startDate=${startDate}&endDate=${endDate}`
  );
  
  return new Response(response.body, {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

**Benefits**:

* Keep existing Node.js backend unchanged
* SvelteKit handles CORS
* Add middleware (auth, rate limiting) easily
* Type-safe endpoints with TypeScript

**Future**: Migrate backend logic to SvelteKit endpoints with database if needed

### Styling Approach

**Recommendation**: Continue with Tailwind CSS + shadcn-svelte components

**Enhancements**:

* Add custom color palette with design tokens
* Use CSS variables for dynamic theming
* Implement glassmorphism utilities:

  ```css
  .glass {
    @apply bg-white/10 backdrop-blur-lg border border-white/20;
  }
  ```
* Add custom animations in Tailwind config
* Use `@tailwindcss/typography` for report text

## Feature Priority Roadmap

### Phase 1: Core Migration (Week 1-2)


1. ✅ Initialize SvelteKit project with dependencies
2. ✅ Set up Svelte stores (workData, settings, ui)
3. ✅ Create API proxy routes
4. ✅ Build Header component
5. ✅ Build FloatingReport component
6. ✅ Build WorkGoalTracker component
7. ✅ Build TimeReport component
8. ✅ Implement basic ReportChart (week view only)
9. ✅ Test feature parity with React version

### Phase 2: Enhanced Features (Week 3)


1. ✅ Implement dark mode with theme toggle
2. ✅ Make Month/Year chart views functional
3. ✅ Add keyboard shortcuts
4. ✅ Build notification system
5. ✅ Implement CSV export
6. ✅ Add loading skeletons and transitions
7. ✅ Mobile responsive improvements

### Phase 3: Advanced Features (Week 4)


1. ✅ Historical comparison tool
2. ✅ PDF export functionality
3. ✅ Enhanced chart interactions (zoom, pan)
4. ✅ PWA setup (optional)
5. ✅ Performance optimization
6. ✅ Accessibility audit and fixes

### Phase 4: Polish & Deploy (Week 5)


1. ✅ UI polish and micro-animations
2. ✅ Cross-browser testing
3. ✅ Write tests (unit + E2E)
4. ✅ Documentation
5. ✅ Deploy to production
6. ✅ Monitor and fix issues

### Future Enhancements (Backlog)

* Time tracking timer (start/stop work sessions)
* Invoice generation from reports
* Multi-user support with authentication
* Email summaries (weekly/monthly)
* Work categories and tagging
* Break time tracking
* Team collaboration features
* Integration with calendar apps (Google Calendar, Outlook)
* Analytics dashboard with trends and insights
* Mobile app (Capacitor or React Native)

## Questions to Resolve


1. **API Backend Compatibility**: Keep existing Node.js backend (port 88) or migrate to SvelteKit endpoints with database?
   * **Recommendation**: Proxy initially, evaluate migration based on scaling needs
2. **Chart Library Choice**: Chart.js vs Apache ECharts vs LayerChart?
   * **Recommendation**: Start with Chart.js, upgrade to ECharts only if specific advanced features needed
3. **Component Library**: shadcn-svelte, Skeleton UI, Flowbite Svelte, or Melt UI?
   * **Recommendation**: shadcn-svelte for consistency with current React codebase
4. **Additional Features Priority**: Which to implement first?
   * **Recommendation**: Dark mode → CSV export → Month/Year charts → Historical comparison → PDF export
5. **Deployment Target**: Vercel, Netlify, Cloudflare Pages, or self-hosted?
   * **Recommendation**: Vercel for simplicity, Cloudflare Pages for global edge performance
6. **PWA Support**: Worth the complexity for offline capability?
   * **Recommendation**: Yes, if user frequently works without internet; otherwise defer to Phase 4
7. **Testing Strategy**: How comprehensive? Unit/Integration/E2E coverage?
   * **Recommendation**: Focus on E2E tests for critical flows (data sync, calculations, export), unit tests for utilities
8. **Authentication**: Will this remain single-user or expand to multi-user?
   * **Recommendation**: Start single-user, design stores to be user-scoped for easy future migration

## Design Inspiration

### UI/UX References

* **Dashboard Design**: Linear app's clean interface
* **Charts**: Notion's analytics, Vercel's deployment graphs
* **Dark Mode**: GitHub's theme implementation
* **Glassmorphism**: Apple's design language (macOS Big Sur+)
* **Animations**: Stripe's dashboard micro-interactions

### Color Palette Suggestion

```css
/* Light Mode */
--primary: 222 47% 11%;        /* Dark slate */
--secondary: 210 40% 96%;      /* Light gray */
--accent: 217 91% 60%;         /* Blue */
--success: 142 76% 36%;        /* Green */
--warning: 38 92% 50%;         /* Amber */
--error: 0 84% 60%;            /* Red */

/* Dark Mode */
--primary: 210 40% 98%;        /* Near white */
--secondary: 222 47% 11%;      /* Dark slate */
--accent: 217 91% 70%;         /* Lighter blue */
```

## Success Metrics

### Performance Targets

* First Contentful Paint: < 1.2s
* Time to Interactive: < 2.5s
* Bundle size: < 150KB (excluding chart library)
* Lighthouse score: > 95

### User Experience

* All features from React version working
* Dark mode implemented and smooth
* Month/Year charts functional
* CSV export working
* Mobile-friendly (100% feature parity)

### Code Quality

* TypeScript strict mode with no `any` types
* 80%+ test coverage on critical paths
* Zero console errors
* Accessible (WCAG AA compliant)


---

## Implementation Checklist

### Phase 1: Foundation (Days 1-3)
- [ ] Step 1.1: Create SvelteKit project
- [ ] Step 1.2: Install all dependencies
- [ ] Step 1.3: Configure environment variables
- [ ] Step 1.4: Set up project structure
- [ ] Step 1.5: Configure Tailwind theme
- [ ] Step 1.6: Create API configuration
- [ ] Step 1.7: Define TypeScript types

### Phase 2: State Management (Days 4-5)
- [ ] Step 2.1: Create persisted store utility
- [ ] Step 2.2: Implement settings store with API sync
- [ ] Step 2.3: Implement work data store with fetch logic
- [ ] Step 2.4: Implement UI store with theme support
- [ ] Step 2.5: Test store functionality

### Phase 3: API Integration (Day 6)
- [ ] Step 3.1: Create work data API routes
- [ ] Step 3.2: Create hourly rate API routes
- [ ] Step 3.3: Create target hours API routes
- [ ] Step 3.4: Create currency API route
- [ ] Step 3.5: Test all API endpoints

### Phase 4: Core Components (Days 7-10)
- [ ] Step 4.1: Create utility functions
- [ ] Step 4.2: Build Header component
- [ ] Step 4.3: Build FloatingReport component
- [ ] Step 4.4: Build WorkGoalTracker component
- [ ] Step 4.5: Build TimeReport component
- [ ] Step 4.6: Build shared components (Loading, Error)

### Phase 5: Charts & Dashboard (Days 11-13)
- [ ] Step 5.1: Create ReportChart component with view mode tabs
- [ ] Step 5.2: Implement context-aware chart data processing (week/month/year)
- [ ] Test comparison logic for each view mode
- [ ] Step 6.1: Create layout with theme support
- [ ] Step 6.2: Assemble main dashboard page
- [ ] Test responsive layout

### Phase 6: Enhanced Features (Days 14-16)
- [ ] Implement Month/Year chart views
- [ ] Add keyboard shortcuts
- [ ] Add CSV export functionality
- [ ] Implement toast notifications
- [ ] Add loading transitions

### Phase 7: Polish & Testing (Days 17-20)
- [ ] Mobile responsive improvements
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Write E2E tests

### Phase 8: Deployment (Day 21)
- [ ] Configure adapter for chosen platform
- [ ] Set up environment variables in production
- [ ] Deploy application
- [ ] Monitor and fix issues

## Quick Start Commands

```bash
# Initial setup
npm create svelte@latest work-report-svelte
cd work-report-svelte
npm install

# Add Tailwind
npx svelte-add@latest tailwindcss

# Add shadcn-svelte
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add button card input label progress badge resizable separator switch sonner

# Install other dependencies
npm install chart.js svelte-chartjs date-fns @lucide/svelte papaparse
npm install -D @types/papaparse @tailwindcss/typography

# Create .env file with API configuration
echo \"VITE_API_BASE_URL=http://localhost:88\" > .env

# Start development
npm run dev

# Build for production
npm run build
npm run preview
```

## API Integration Notes

**Important**: Make sure your backend server (port 88) is running before starting the SvelteKit app.

**Backend Requirements**:
- Must be accessible at `http://localhost:88`
- All endpoints documented in the \"Backend API Documentation\" section must be implemented
- CORS should allow requests from SvelteKit dev server (`http://localhost:5173`)

**Testing API Connection**:
```bash
# Test backend is running
curl http://localhost:88/getHourlyRate
curl http://localhost:88/getTargetHours

# Test SvelteKit proxy (after starting dev server)
curl http://localhost:5173/api/hourly-rate
curl http://localhost:5173/api/target-hours
```

## Next Steps

1. ✅ Review and approve this plan
2. ⏭️ Create new GitHub repository: `work-report-svelte`
3. ⏭️ Follow Phase 1 checklist to initialize project
4. ⏭️ Ensure backend server (port 88) is running
5. ⏭️ Begin implementation following the 8-step structure
6. ⏭️ Test each component as you build it
7. ⏭️ Commit frequently with descriptive messages

**Estimated Timeline**: 3-4 weeks for complete implementation with all features


