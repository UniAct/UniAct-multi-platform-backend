import { workerData, parentPort } from "worker_threads";
import bcrypt from "bcrypt";

// Extract data passed from the main thread
const { nationalIds, saltRounds } = workerData as {
  nationalIds: string[];
  saltRounds: number;
};

// Hash all national IDs concurrently using bcrypt
// Then send the resulting hashes back to the main thread
Promise.all(nationalIds.map((id) => bcrypt.hash(id, saltRounds)))
  .then((hashes) => parentPort!.postMessage({ hashes }))
  .catch((err)   => parentPort!.postMessage({ error: err.message }));