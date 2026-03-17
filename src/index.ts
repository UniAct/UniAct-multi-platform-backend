import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import JSendStatus from "./Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import swaggerUi from "swagger-ui-express";
import { SwaggerSpec } from "./Utils/SwaggerConfig";
import MainRouter from "./Routes/MainRouter";
import multer from "multer";
import { ErrorHandler } from "./Middlewares/ErrorHandler";
import { setupTenantClientShutdownHooks } from "./Utils/prismaClient";

dotenv.config();
setupTenantClientShutdownHooks();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ==================== MIDDLEWARE ====================

// CORS Configuration - Allow requests from frontend
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        // Dynamically allow all subdomain:5173 requests
        /^http:\/\/[a-z0-9\-]+:5173$/,
        /^http:\/\/[a-z0-9\-]+:3000$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ==================== ROOT ROUTE ====================

// Root health check
app.get('/', (req, res) => {
    res.status(StatusCodes.ACCEPTED).json({
        status: 'success',
        message: 'UniAct Backend API Running',
        environment: process.env.NODE_ENV,
        tenant: (req as any).tenant ? `Tenant: ${(req as any).tenant.name}` : 'SuperAdmin Context'
    });
});

// ==================== API ROUTES ====================

app.use("/api", MainRouter)

app.use(ErrorHandler)
// ==================== SWAGGER DOCUMENTATION ====================

if (process.env.NODE_ENV?.toLowerCase() === "development") {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(SwaggerSpec));
    console.log('Swagger docs available at http://localhost:3000/api-docs');
}


// ==================== 404 HANDLER ====================

app.all(/.*/, (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: {
            route: "Route not found",
            path: req.path,
            method: req.method,
            hint: "Ensure route is prefixed with /api (e.g., /api/user instead of /user)"
        }
    });
});

// ==================== Multer-specific error handler ====================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError || err.message?.includes("PDF")) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: JSendStatus.FAIL,
            message: err.message,
        });
    }
    next(err);
});

// ==================== ERROR HANDLER ====================

// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.error('Unhandled error:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//         status: 'error',
//         message: 'Internal Server Error',
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
// });

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`\n✓ UniAct Backend Running`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV}`);
    console.log(`  SuperAdmin Access: http://localhost:${PORT}`);
    console.log(`  Tenant Access: http://<tenant>:${PORT}`);
    console.log(`  (Make sure hosts file has: 127.0.0.1 anu, 127.0.0.1 auc)`);
    console.log('');
});
