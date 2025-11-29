# Data Fetching and Flow Documentation

## Overview
This document provides a comprehensive analysis of how data is fetched and used throughout the Work Report Svelte application.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Fetching Points](#data-fetching-points)
3. [API Endpoints](#api-endpoints)
4. [Stores and State Management](#stores-and-state-management)
5. [Data Flow Diagram](#data-flow-diagram)
6. [Component Usage](#component-usage)

---

## Architecture Overview

The application follows a **layered architecture**:

```
Frontend Components (Svelte)
         ↓
    Svelte Stores (State Management)
         ↓
   SvelteKit API Routes (Proxy Layer)
         ↓
    Backend API (External Server)
```

### Key Characteristics:
- **Client-Side Rendering**: Data fetching happens in the browser
- **Proxy Pattern**: SvelteKit API routes act as a proxy to the backend
- **Reactive Stores**: Svelte stores manage application state
- **Persistent Storage**: LocalStorage for caching user preferences

---

## Data Fetching Points

### 1. Initial App Load (`+page.svelte`)

**Location**: `src/routes/+page.svelte`

**When**: On component mount (`onMount` hook)

**What Gets Fetched**:
```typescript
onMount(async () => {
    await Promise.all([
        loadWorkData(),           // Work entries for current/previous period
        syncHourlyRateFromAPI(),  // User's hourly rate
        syncTargetHoursFromAPI(), // Weekly target hours
        fetchCurrencyRate()       // USD to BDT conversion rate
    ]);
});
```

**Execution**: All 4 API calls run in **parallel** for optimal performance.

---

## API Endpoints

### 1. Work Data API

#### **Endpoint**: `/api/work-data`

**Purpose**: Fetch work entries for a date range

**Method**: `GET`

**Parameters**:
- `startDate` (YYYY-MM-DD)
- `endDate` (YYYY-MM-DD)

**Flow**:
```
Component → Store Function → SvelteKit API → Backend API → Response
```

**Implementation**:

**Frontend Store** (`src/lib/stores/workData.ts`):
```typescript
export async function fetchWorkData(start: Date, end: Date): Promise<WorkData> {
    const startStr = formatDateISO(start);
    const endStr = formatDateISO(end);
    
    const response = await fetch(`/api/work-data?startDate=${startStr}&endDate=${endStr}`);
    const data = await response.json();
    return calculateTotals(data.workData || []);
}
```

**Proxy Layer** (`src/routes/api/work-data/+server.ts`):
```typescript
export const GET: RequestHandler = async ({ url, fetch }) => {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    const backendUrl = `${config.api.baseURL}/work-data?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(backendUrl);
    const data = await response.json();
    
    return json({ workData: data });
};
```

**Backend URL**: 
- Configured in: `src/lib/config/index.ts`
- Default: `http://localhost:88/work-data`

**Data Structure Returned**:
```typescript
{
    entries: WorkEntry[],
    totalHours: number,
    totalMinutes: number
}

// WorkEntry interface
{
    date: string,        // ISO date format
    startTime: string,
    endTime: string,
    duration: number,    // in minutes
    description?: string
}
```

---

#### **Endpoint**: `/api/work-data/today`

**Purpose**: Fetch today's live work time

**Method**: `GET`

**Parameters**: None

**Flow**:
```typescript
export async function fetchTodayWork(): Promise<WorkData> {
    const response = await fetch('/api/work-data/today');
    const data = await response.json();
    
    return {
        entries: [],
        totalHours: Math.floor(data.totalMinutes / 60),
        totalMinutes: data.totalMinutes || 0
    };
}
```

**Backend URL**: `http://localhost:88/worktime`

**Data Structure**:
```typescript
{
    hours: number,
    minutes: number,
    totalMinutes: number
}
```

---

### 2. Hourly Rate API

#### **Endpoint**: `/api/hourly-rate`

**Purpose**: Get and update user's hourly rate

**Methods**: `GET` and `POST`

**GET Request**:
```typescript
export async function syncHourlyRateFromAPI() {
    const response = await fetch('/api/hourly-rate');
    const data = await response.json();
    hourlyRate.set(data.rate || config.defaults.hourlyRate);
}
```

**POST Request**:
```typescript
export async function updateHourlyRate(rate: number) {
    const response = await fetch(`/api/hourly-rate?rate=${rate}`, {
        method: 'POST'
    });
    
    if (response.ok) {
        hourlyRate.set(rate);
        return true;
    }
    return false;
}
```

**Backend URLs**: 
- GET: `http://localhost:88/getHourlyRate`
- POST: `http://localhost:88/setHourlyRate?rate={value}`

**Storage**: 
- Persisted in localStorage with key: `'hourlyRate'`
- Synced with backend on app load

---

### 3. Target Hours API

#### **Endpoint**: `/api/target-hours`

**Purpose**: Get and update weekly target hours

**Methods**: `GET` and `POST`

**GET Request**:
```typescript
export async function syncTargetHoursFromAPI() {
    const response = await fetch('/api/target-hours');
    const data = await response.json();
    targetHours.set(data.hours || config.defaults.targetHours);
}
```

**POST Request**:
```typescript
export async function updateTargetHours(hours: number) {
    const response = await fetch(`/api/target-hours?hours=${hours}`, {
        method: 'POST'
    });
    
    if (response.ok) {
        targetHours.set(hours);
        return true;
    }
    return false;
}
```

**Backend URLs**: 
- GET: `http://localhost:88/getTargetHours`
- POST: `http://localhost:88/setTargetHours?hours={value}`

**Storage**: 
- Persisted in localStorage with key: `'targetHours'`
- Default value: 40 hours

---

### 4. Currency Rate API

#### **Endpoint**: `/api/currency`

**Purpose**: Get USD to BDT conversion rate

**Method**: `GET`

**External API**: `http://www.geoplugin.net/json.gp`

**Flow**:
```typescript
export async function fetchCurrencyRate() {
    const currentRate = get(dollarRate);
    
    // Return cached rate if valid
    if (currentRate && currentRate > 0) {
        return currentRate;
    }
    
    const response = await fetch('/api/currency');
    const data = await response.json();
    const rate = data.geoplugin_currencyConverter || 120;
    
    dollarRate.set(rate);
    return rate;
}
```

**Caching Strategy**:
- Cached in localStorage with TTL (Time To Live)
- TTL: 1 hour (3,600,000 milliseconds)
- Fallback rate: 120 BDT per USD

**Data Structure**:
```typescript
{
    geoplugin_currencyCode: string,      // "BDT"
    geoplugin_currencyConverter: number  // Exchange rate
}
```

---

## Stores and State Management

### Store Structure

```
src/lib/stores/
├── index.ts              # Re-exports all stores
├── persisted.ts          # LocalStorage persistence utilities
├── settings.ts           # User settings (rate, hours, currency)
├── ui.ts                 # UI state (theme, loading)
└── workData.ts          # Work entries and time data
```

---

### 1. Work Data Store (`workData.ts`)

**Stores**:
```typescript
// View mode: 'week' | 'month' | 'year'
export const viewMode = writable<ViewMode>('week');

// Current date range being viewed
export const dateRange = writable<DateRange>({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 })
});

// Main work data state
export const workDataState = writable<WorkDataState>({
    currentWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
    previousWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
    todayWork: { entries: [], totalHours: 0, totalMinutes: 0 },
    isLoading: false,
    error: null
});
```

**Derived Stores** (computed values):
```typescript
export const currentWeekData = derived(workDataState, ($state) => $state.currentWeek);
export const previousWeekData = derived(workDataState, ($state) => $state.previousWeek);
export const todayWorkData = derived(workDataState, ($state) => $state.todayWork);
export const isLoading = derived(workDataState, ($state) => $state.isLoading);
export const error = derived(workDataState, ($state) => $state.error);
```

**Key Function**: `loadWorkData()`

This is the **main data fetching orchestrator**:

```typescript
export async function loadWorkData() {
    const range = get(dateRange);
    const mode = get(viewMode);
    
    workDataState.update((state) => ({ 
        ...state, 
        isLoading: true, 
        error: null 
    }));
    
    // Calculate previous period dates based on view mode
    let prevStart: Date, prevEnd: Date;
    
    switch (mode) {
        case 'week':
            prevStart = startOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
            prevEnd = endOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
            break;
        case 'month':
            prevStart = startOfMonth(subMonths(range.startDate, 1));
            prevEnd = endOfMonth(subMonths(range.startDate, 1));
            break;
        case 'year':
            prevStart = startOfYear(subYears(range.startDate, 1));
            prevEnd = endOfYear(subYears(range.startDate, 1));
            break;
    }
    
    // Fetch all data in parallel
    const [currentData, previousData, todayData] = await Promise.all([
        fetchWorkData(range.startDate, range.endDate),
        fetchWorkData(prevStart, prevEnd),
        fetchTodayWork()
    ]);
    
    workDataState.set({
        currentWeek: currentData,
        previousWeek: previousData,
        todayWork: todayData,
        isLoading: false,
        error: null
    });
}
```

**Navigation Functions**:
- `nextPeriod()` - Navigate to next week/month/year
- `previousPeriod()` - Navigate to previous week/month/year
- `setViewMode(mode)` - Change view mode and refresh data
- `refreshWorkData()` - Reload current data

---

### 2. Settings Store (`settings.ts`)

**Persisted Stores**:
```typescript
export const hourlyRate = persisted<number>('hourlyRate', config.defaults.hourlyRate);
export const targetHours = persisted<number>('targetHours', config.defaults.targetHours);
export const dollarRate = persistedWithTTL<number>('dollarRate', 120, config.cache.currencyRateTTL);
export const shortDescription = persisted<string>('shortDescription', '');
```

**Combined Settings Store**:
```typescript
export const settings = derived(
    [hourlyRate, targetHours, dollarRate, shortDescription],
    ([$hourlyRate, $targetHours, $dollarRate, $shortDescription]) => ({
        hourlyRate: $hourlyRate,
        targetHours: $targetHours,
        dollarRate: $dollarRate,
        shortDescription: $shortDescription
    })
);
```

**Sync Strategy**:
1. Load from localStorage (instant)
2. Sync with backend API (on mount)
3. Update both on user changes

---

### 3. Persistence Layer (`persisted.ts`)

**Basic Persistence**:
```typescript
export function persisted<T>(key: string, initialValue: T): Writable<T> {
    // Get from localStorage
    const stored = browser ? localStorage.getItem(key) : null;
    let data: T;
    
    try {
        data = stored ? JSON.parse(stored) : initialValue;
    } catch (e) {
        console.warn(`Failed to parse localStorage key "${key}"`);
        data = initialValue;
    }
    
    const store = writable<T>(data);
    
    // Save to localStorage on changes
    if (browser) {
        store.subscribe((value) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }
    
    return store;
}
```

**TTL Persistence** (for currency rate):
```typescript
export function persistedWithTTL<T>(
    key: string, 
    initialValue: T, 
    ttl: number
): Writable<T> {
    const stored = browser ? localStorage.getItem(key) : null;
    let data: PersistedData<T>;
    
    if (stored) {
        data = JSON.parse(stored);
        // Check if expired
        if (Date.now() - data.timestamp > ttl) {
            data = { value: initialValue, timestamp: Date.now() };
        }
    } else {
        data = { value: initialValue, timestamp: Date.now() };
    }
    
    const store = writable<T>(data.value);
    
    if (browser) {
        store.subscribe((value) => {
            const newData: PersistedData<T> = {
                value,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(newData));
        });
    }
    
    return store;
}
```

---

## Data Flow Diagram

### Complete Request Flow

```
┌─────────────────┐
│   User Action   │
│  (Page Load)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│    +page.svelte (onMount)               │
│  ┌──────────────────────────────────┐   │
│  │ Promise.all([                    │   │
│  │   loadWorkData()                 │◄──┼─── Fetches current + previous period data
│  │   syncHourlyRateFromAPI()        │◄──┼─── Fetches hourly rate
│  │   syncTargetHoursFromAPI()       │◄──┼─── Fetches target hours
│  │   fetchCurrencyRate()            │◄──┼─── Fetches USD→BDT rate
│  │ ])                               │   │
│  └──────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Store Functions                 │
│  (src/lib/stores/*.ts)                  │
│                                         │
│  • Calculate date ranges                │
│  • Format parameters                    │
│  • Make fetch requests                  │
│  • Handle responses                     │
│  • Update stores                        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│     SvelteKit API Routes                │
│  (src/routes/api/**/*.ts)               │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  /api/work-data               │─────┼──► Backend: /work-data
│  │  /api/work-data/today         │─────┼──► Backend: /worktime
│  │  /api/hourly-rate (GET/POST)  │─────┼──► Backend: /getHourlyRate | /setHourlyRate
│  │  /api/target-hours (GET/POST) │─────┼──► Backend: /getTargetHours | /setTargetHours
│  │  /api/currency                │─────┼──► External: geoplugin.net
│  └────────────────────────────────┘    │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Backend / External APIs            │
│                                         │
│  • PHP Backend (localhost:88)           │
│  • GeoPlugin Currency API               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│          Response Flow                  │
│                                         │
│  Backend → SvelteKit → Store → Update   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      LocalStorage Caching               │
│                                         │
│  • hourlyRate                           │
│  • targetHours                          │
│  • dollarRate (with TTL)                │
│  • shortDescription                     │
│  • theme                                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Svelte Components                  │
│  (Reactive UI Updates)                  │
│                                         │
│  • WorkGoalTracker                      │
│  • TimeReport                           │
│  • FloatingReport                       │
│  • Header                               │
└─────────────────────────────────────────┘
```

---

## Component Usage

### How Components Consume Data

#### 1. **WorkGoalTracker.svelte**

**Imports**:
```typescript
import { settings, updateHourlyRate, updateTargetHours } from '$lib/stores';
import { currentWeekData } from '$lib/stores';
```

**Data Used**:
- `$settings.hourlyRate` - User's hourly rate
- `$settings.targetHours` - Weekly target hours
- `$settings.dollarRate` - Currency conversion rate
- `$currentWeekData.totalMinutes` - Current period total work time

**Calculations**:
```typescript
$: progress = calculateProgress($currentWeekData.totalMinutes, $settings.targetHours);
$: earningsUSD = calculateEarnings($currentWeekData.totalMinutes, $settings.hourlyRate);
$: earningsBDT = calculateEarningsInBDT(
    $currentWeekData.totalMinutes,
    $settings.hourlyRate,
    $settings.dollarRate
);
$: remainingDays = calculateRemainingDays();
$: requiredHoursPerDay = calculateRequiredHoursPerDay(
    $settings.targetHours,
    $currentWeekData.totalMinutes,
    remainingDays
);
```

**User Interactions**:
- Edit hourly rate → Calls `updateHourlyRate()` → POST to API
- Edit target hours → Calls `updateTargetHours()` → POST to API

---

#### 2. **TimeReport.svelte**

**Imports**:
```typescript
import { currentWeekData, previousWeekData, todayWorkData, viewMode } from '$lib/stores';
```

**Data Used**:
- `$currentWeekData.entries` - Work entries for current period
- `$previousWeekData.totalMinutes` - Previous period comparison
- `$todayWorkData.totalMinutes` - Today's live time
- `$viewMode` - Current view (week/month/year)

**Processing**:
```typescript
$: dailyTotals = calculateDailyTotals($currentWeekData.entries);
$: chartData = dailyTotals.map(day => ({
    label: format(parseISO(day.date), 'EEE'),
    value: day.totalMinutes,
    isToday: checkIsToday(day.date)
}));
```

**Visual Components**:
- Bar chart showing daily breakdown
- Trend indicator (current vs previous)
- Summary cards with animations

---

#### 3. **Header.svelte**

**Imports**:
```typescript
import { previousPeriod, nextPeriod, refreshWorkData, viewMode, dateRange, setViewMode } from '$lib/stores';
```

**User Actions**:
- Click previous arrow → `previousPeriod()` → Refetch data for previous period
- Click next arrow → `nextPeriod()` → Refetch data for next period
- Change view mode → `setViewMode(mode)` → Recalculate dates & refetch
- Click refresh → `refreshWorkData()` → Reload current data

---

#### 4. **FloatingReport.svelte**

**Imports**:
```typescript
import { settings, dateRange, currentWeekData } from '$lib/stores';
```

**Data Used**:
- `$dateRange` - Current period dates
- `$currentWeekData.totalMinutes` - Total work time
- `$settings.hourlyRate` - For earnings calculation
- `$settings.dollarRate` - For BDT conversion
- `$settings.shortDescription` - User's work description

**Output**:
Generates formatted report text with all calculated values

---

## Data Refresh Triggers

### When Data Gets Refetched

1. **Page Load** (`onMount` in +page.svelte)
   - All 4 API calls execute

2. **View Mode Change** (Week → Month → Year)
   - `setViewMode()` → Recalculates date ranges → `loadWorkData()`

3. **Navigation** (Previous/Next buttons)
   - `previousPeriod()` or `nextPeriod()` → Updates date range → `loadWorkData()`

4. **Manual Refresh** (Refresh button)
   - `refreshWorkData()` → Calls `loadWorkData()`

5. **Settings Update** (Edit hourly rate or target hours)
   - POST request to backend
   - LocalStorage updated immediately
   - No full reload needed (reactive stores)

---

## Caching Strategy

### What Gets Cached

| Data | Storage | TTL | Update Strategy |
|------|---------|-----|-----------------|
| Hourly Rate | localStorage | ∞ | Sync on mount, update on edit |
| Target Hours | localStorage | ∞ | Sync on mount, update on edit |
| Currency Rate | localStorage | 1 hour | Check TTL, fetch if expired |
| Short Description | localStorage | ∞ | Update on input change |
| Theme | localStorage | ∞ | Update on toggle |

### What Doesn't Get Cached

- **Work data** (entries, totals)
- **Today's live time**
- Always fetched fresh from backend

---

## Error Handling

### API Request Failures

All API functions include error handling:

```typescript
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed');
    return await response.json();
} catch (error) {
    console.error('Error:', error);
    return fallbackValue; // Default or empty data
}
```

### Fallback Values

- **Hourly Rate**: 0 (from config)
- **Target Hours**: 40 (from config)
- **Currency Rate**: 120 BDT/USD
- **Work Data**: Empty arrays with 0 totals

### User Feedback

- Loading states: `isLoading` store
- Error messages: `error` store
- Toast notifications: Not implemented yet

---

## Configuration

### Environment Variables

Defined in `.env` file:

```env
PUBLIC_VITE_API_BASE_URL=http://localhost:88
PUBLIC_VITE_CURRENCY_API_URL=http://www.geoplugin.net/json.gp
PUBLIC_VITE_DEFAULT_HOURLY_RATE=0
PUBLIC_VITE_DEFAULT_TARGET_HOURS=40
```

### Config File

**Location**: `src/lib/config/index.ts`

```typescript
export const config = {
    api: {
        baseURL: env.PUBLIC_VITE_API_BASE_URL || 'http://localhost:88',
        currencyURL: env.PUBLIC_VITE_CURRENCY_API_URL || 'http://www.geoplugin.net/json.gp',
        endpoints: {
            workData: '/work-data',
            workTime: '/worktime',
            hourlyRate: '/getHourlyRate',
            setHourlyRate: '/setHourlyRate',
            targetHours: '/getTargetHours',
            setTargetHours: '/setTargetHours'
        }
    },
    defaults: {
        hourlyRate: Number(env.PUBLIC_VITE_DEFAULT_HOURLY_RATE) || 0,
        targetHours: Number(env.PUBLIC_VITE_DEFAULT_TARGET_HOURS) || 40
    },
    cache: {
        currencyRateTTL: 60 * 60 * 1000 // 1 hour
    }
};
```

---

## Performance Optimizations

1. **Parallel Requests**: `Promise.all()` for simultaneous API calls
2. **LocalStorage Caching**: Reduces API calls for settings
3. **TTL Caching**: Currency rate cached for 1 hour
4. **Derived Stores**: Computed values cached by Svelte
5. **Proxy Layer**: SvelteKit routes handle CORS and security

---

## Future Improvements

### Suggested Enhancements

1. **Add Loading Skeletons**: Show placeholders during fetch
2. **Implement Retry Logic**: Auto-retry failed requests
3. **Add Offline Support**: Service worker with IndexedDB
4. **Batch Requests**: Combine multiple API calls
5. **WebSocket Support**: Real-time updates for today's time
6. **Request Deduplication**: Prevent duplicate concurrent requests
7. **Error Boundaries**: Better error UI feedback
8. **Optimistic Updates**: Update UI before API response

---

## Summary

### Key Takeaways

✅ **4 Main API Endpoints**: Work data, hourly rate, target hours, currency rate

✅ **Proxy Pattern**: SvelteKit routes proxy backend requests

✅ **Reactive Stores**: Svelte stores manage all state

✅ **Smart Caching**: LocalStorage with TTL for optimal performance

✅ **Parallel Fetching**: All initial data loads simultaneously

✅ **Error Resilience**: Fallback values for all APIs

✅ **Type Safety**: Full TypeScript coverage

---

## Quick Reference

### Import Patterns

```typescript
// In components, import from main store index
import { 
    loadWorkData, 
    currentWeekData, 
    settings, 
    updateHourlyRate 
} from '$lib/stores';

// Use reactive $syntax to access store values
$: totalMinutes = $currentWeekData.totalMinutes;
$: rate = $settings.hourlyRate;
```

### API Call Pattern

```typescript
// Standard fetch pattern used throughout
const response = await fetch('/api/endpoint?param=value');
const data = await response.json();
store.set(data);
```

### Store Update Pattern

```typescript
// Update store and sync with backend
async function updateSetting(newValue) {
    const response = await fetch('/api/endpoint', { method: 'POST' });
    if (response.ok) {
        store.set(newValue); // Update local state
        return true;
    }
    return false;
}
```

---

**Last Updated**: November 29, 2025  
**Version**: 1.0.0
