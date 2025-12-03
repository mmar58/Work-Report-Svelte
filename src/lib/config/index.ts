import { env } from '$env/dynamic/public';

export const config = {
	api: {
		baseURL: env.PUBLIC_API_BASE_URL || 'http://localhost:88',
		currencyURL: env.PUBLIC_CURRENCY_API_URL || 'http://www.geoplugin.net/json.gp',
		endpoints: {
			workData: '/work-data',
			workTime: '/worktime',
			hourlyRate: '/hourlyRate',
			targetHours: '/getTargetHours',
			setTargetHours: '/setTargetHours'
		}
	},
	defaults: {
		hourlyRate: Number(env.PUBLIC_DEFAULT_HOURLY_RATE) || 0,
		targetHours: Number(env.PUBLIC_DEFAULT_TARGET_HOURS) || 40
	},
	cache: {
		currencyRateTTL: 60 * 60 * 1000 // 1 hour in milliseconds
	}
};
