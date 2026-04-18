import { logger } from "../../Utils/Logger";
import { StartEnrollmentWebSocketServer } from "./EnrollmentWebSocket";

const WS_PORT = 4001;

process.title = "Enrollment WS Server";

StartEnrollmentWebSocketServer(WS_PORT).catch((err) => {
  logger.error({ message: "WS Server failed to start", err });
  process.exit(1);
});

logger.info({
  action: "WS Server",
  message: "WebSocket Server Started....",
  processId: process.pid,
  processName: process.title,
  port: WS_PORT,
});