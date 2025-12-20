import { env } from '$env/dynamic/public';

export const config = {
    api: {
        baseUrl: env.VITE_API_BASE_URL || 'http://192.168.0.2:88',
        currencyUrl: env.VITE_CURRENCY_API_URL || 'http://www.geoplugin.net/json.gp'
    },
    defaults: {
        hourlyRate: Number(env.VITE_DEFAULT_HOURLY_RATE) || 0,
        targetHours: Number(env.VITE_DEFAULT_TARGET_HOURS) || 40
    },
    features: {
        darkMode: (env.VITE_ENABLE_DARK_MODE as unknown as string) === 'true',
        pdfExport: (env.VITE_ENABLE_PDF_EXPORT as unknown as string) === 'true'
    },
    cache: {
        currencyRateTTL: 60 * 60 * 1000 // 1 hour in milliseconds
    }
};
