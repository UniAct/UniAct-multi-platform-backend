import type { CorsOptions } from "cors";

const allowedOrigins: Array<string | RegExp> = [
    // Development
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    // Local subnet development
    /^http:\/\/[a-z0-9-]+:5173$/,
    /^http:\/\/[a-z0-9-]+:3000$/,
    // Vercel preview deployments
    /^https:\/\/web-frontend-[a-z0-9-]+\.vercel\.app$/,
    'https://web-frontend-three-eta.vercel.app',
    // Production tenant, branding, and super-admin surfaces
    'https://uniact.website',
    'https://www.uniact.website',
    'https://public.uniact.website',
    /^https:\/\/[a-z0-9-]+\.uniact\.website$/,
];

function isAllowedOrigin(origin: string): boolean {
    return allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === "string") {
            return allowedOrigin === origin;
        }

        return allowedOrigin.test(origin);
    });
}

export const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked origin: ${origin}`));
    },

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'university-name',
        'semester-id'
    ],

    maxAge: 86400,
    optionsSuccessStatus: 204,
};
