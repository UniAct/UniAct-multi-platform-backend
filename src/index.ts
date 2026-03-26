import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import JSendStatus from "./Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import MainRouter from "./Routes/MainRouter";
import { ErrorHandler } from "./Middlewares/ErrorHandler";
import { httpLogger, logger } from "./Utils/Logger";
import { GracefulShutdown } from "./Utils/Shutdown";

dotenv.config();

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
    allowedHeaders: ['Content-Type', 'Authorization', 'university-name'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
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

app.use("/api", MainRouter);

app.use(ErrorHandler);
// ==================== SWAGGER DOCUMENTATION ====================

if (process.env.NODE_ENV?.toLowerCase() === "development") {
    // dev dependencies
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

<<<<<<< HEAD
// ==================== Graceful shutdown ====================  


<<<<<<< HEAD
// ==================== BOOTSTRAP ====================
async function Bootstrap(): Promise<void> {
  process.title = "UniAct Backend System";
  logger.info({ 
    action: "RabbitMQ", 
    status: "Queues Asserted" 
  });
  const server = app.listen(PORT, () => {
      logger.info({
          action: "Server Start",
          status: "Running",
          port: PORT,
          environment: process.env.NODE_ENV,
          url: "http://localhost:3000",
          process_id: process.pid,
          process_name: process.title
      });
  });
   GracefulShutdown(server);
}

=======
=======
>>>>>>> c062150 (add npm dev script to automate docker compose, prisma generate types , worker, and server startup)
// ==================== Graceful shutdown ====================  
GracefulShutdown();

// ==================== BOOTSTRAP ====================
async function Bootstrap(): Promise<void> {
  process.title = "UniAct Backend System";
  logger.info({ 
    action: "RabbitMQ", 
    status: "Queues Asserted" 
  });

  app.listen(PORT, () => {
      logger.info({
          action: "Server Start",
          status: "Running",
          port: PORT,
          environment: process.env.NODE_ENV,
          url: "http://localhost:3000",
          process_id: process.pid,
          process_name: process.title
      });
  });
}

>>>>>>> 054927e (- Add single student creation)
Bootstrap();
