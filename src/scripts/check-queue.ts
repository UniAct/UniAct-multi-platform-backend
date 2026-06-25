import dotenv from "dotenv";
import { GetQueue } from "../Utils/BullMQConfig";
import { Queues } from "../Enums/Queues";

dotenv.config();

(async () => {
  try {
    const queue = GetQueue(Queues.TranscriptGeneration);
    
    const counts = await queue.getJobCounts();
    console.log("Queue counts:", counts);

    const jobs = await queue.getJobs();
    console.log(`Total jobs: ${jobs.length}`);
    
    if (jobs.length > 0) {
      jobs.slice(0, 5).forEach((job, i) => {
        console.log(`Job ${i + 1}: id=${job.id}, progress=${JSON.stringify(job.progress)}, data=${JSON.stringify(job.data)}`);
      });
    }

    process.exit(0);
  } catch (err: any) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();
