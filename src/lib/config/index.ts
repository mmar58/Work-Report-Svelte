import { env } from '$env/dynamic/public';

export const config = {
    api: {
        baseUrl: (() => {
            if (typeof window === 'undefined') return 'http://localhost:88';
            const { protocol, hostname } = window.location;
            if (protocol === 'https:') return `https://${hostname}:88`;
            if (hostname === 'localhost') return 'http://localhost:88';
            return 'http://192.168.0.2:88'; // Default for other HTTP
        })(),
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
