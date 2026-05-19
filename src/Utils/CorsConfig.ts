export const corsOptions = {
    origin: [
        // Development
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        // Local subnet development
        /^http:\/\/[a-z0-9\-]+:5173$/,
        /^http:\/\/[a-z0-9\-]+:3000$/,
        // Vercel preview deployments
        'https://web-frontend-three-eta.vercel.app',
        // Production: wildcard for *.uniact.website subdomains
        /^https:\/\/.*\.uniact\.website$/,
    ],

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'university-name'
    ],
};
