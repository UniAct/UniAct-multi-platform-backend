import { TranscriptService } from "../Services/TranscriptService";

(async () => {
  const SEMESTER_ID = Number(process.env.SEMESTER_ID || 12);
  const FACULTY_ID = Number(process.env.FACULTY_ID || 4);
  const SCHEMA_NAME = process.env.SCHEMA_NAME || "anu";

  try {
    console.log(
      `Queueing faculty transcript generation: semesterId=${SEMESTER_ID}, facultyId=${FACULTY_ID}, schema=${SCHEMA_NAME}`
    );

    const queuedJob = await TranscriptService.QueueFacultySemesterTranscripts(
      SEMESTER_ID,
      FACULTY_ID,
      SCHEMA_NAME
    );

    console.log("Queued job:", JSON.stringify(queuedJob, null, 2));
    console.log("Transcript job enqueued. Poll /job/student-transcript/:id for progress.");
  } catch (err: any) {
    console.error("Error triggering generation:", err.message || err);
    process.exit(1);
  }
})();
