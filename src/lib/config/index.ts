import { env } from '$env/dynamic/public';

export const config = {
    api: {
        baseUrl: env.PUBLIC_API_BASE_URL || 'http://192.168.0.2:88',
        currencyUrl: env.PUBLIC_CURRENCY_API_URL || 'http://www.geoplugin.net/json.gp'
    },
    defaults: {
        hourlyRate: Number(env.PUBLIC_DEFAULT_HOURLY_RATE) || 0,
        targetHours: Number(env.PUBLIC_DEFAULT_TARGET_HOURS) || 40
    },
    features: {
        darkMode: (env.PUBLIC_ENABLE_DARK_MODE as unknown as string) === 'true',
        pdfExport: (env.PUBLIC_ENABLE_PDF_EXPORT as unknown as string) === 'true'
    },
    cache: {
        currencyRateTTL: 60 * 60 * 1000 // 1 hour in milliseconds
    }
};
