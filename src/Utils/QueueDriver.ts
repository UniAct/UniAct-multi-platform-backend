export function UseMemoryQueue(): boolean {
  return (process.env.QUEUE_DRIVER || "").toLowerCase() === "memory";
}
