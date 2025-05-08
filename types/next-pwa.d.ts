/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "next-pwa" {
    import { NextConfig } from "next"; // Make sure 'next' types are available

    interface WorkboxOption {
        swDest?: string;
        [key: string]: any;
    }

    interface RuntimeCaching {
        urlPattern: string | RegExp;
        handler:
            | "CacheFirst"
            | "CacheOnly"
            | "NetworkFirst"
            | "NetworkOnly"
            | "StaleWhileRevalidate";
        method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD";
        options?: {
            cacheName?: string;
            expiration?: {
                maxEntries?: number;
                maxAgeSeconds?: number;
                purgeOnQuotaError?: boolean;
            };
            plugins?: any[]; // Be more specific if you use plugins
            // ... other handler options
            [key: string]: any;
        };
    }

    interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        skipWaiting?: boolean;
        sw?: string;
        swSrc?: string; // For custom service worker
        scope?: string;
        cacheStartUrl?: boolean;
        dynamicStartUrl?: boolean;
        reloadOnOnline?: boolean;
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
            [key: string]: string | undefined;
        };
        publicExcludes?: string[];
        buildExcludes?: (string | RegExp)[];
        cacheOnFrontEndNav?: boolean;
        aggressiveFrontEndNavCaching?: boolean;
        workboxOptions?: WorkboxOption;
        runtimeCaching?: RuntimeCaching[];
        // For Next.js 11+ custom worker, `next-pwa` might add its own options
        // or expect them within workboxOptions.
        // Add other PWA options you use based on next-pwa documentation.
        [key: string]: any; // Allow other properties
    }

    type WithPWA = (
        pwaConfig: PWAConfig,
    ) => (nextConfig?: NextConfig) => NextConfig;

    const withPWA: WithPWA;
    export default withPWA;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
