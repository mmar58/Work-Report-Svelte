// Work Entry Types
export interface WorkEntry {
	date: string; // ISO date format
	startTime: string;
	endTime: string;
	duration: number; // in minutes
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
	currentWeek: WorkData;
	previousWeek: WorkData;
	todayWork: WorkData;
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

// View Mode Type
export type ViewMode = 'week' | 'month' | 'year';
