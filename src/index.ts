import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import MainRouter from "./Routes/MainRouter";
import { ErrorHandler } from "./Middlewares/ErrorHandler";
import { httpLogger, logger } from "./Utils/Logger";
import { GracefulShutdown } from "./Utils/Shutdown";
import { corsOptions } from "./Utils/CorsConfig";
import { Environment } from "./Utils/Environment";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.use("/api", MainRouter);

app.use(ErrorHandler);


if (Environment.IsDevelopment()) {
  // dev dependencies
}

async function Bootstrap(): Promise<void> {
    process.title = "UniAct Backend System";
    const server = app.listen(PORT, () => {
        logger.info({
            process_name: process.title,
            action: "Server Start",
            status: "Running",
            port: PORT,
            process_id: process.pid,
            environment: process.env.NODE_ENV,
            url: `http://localhost:${PORT}`,
        });
    });
    GracefulShutdown(server);
}

Bootstrap();

export default app;
