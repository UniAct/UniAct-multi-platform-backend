import { TranscriptService } from "../Services/TranscriptService";

(async () => {
  const SEMESTER_ID = 12;
  const FACULTY_ID = 4;
  const SCHEMA_NAME = "anu";

  try {
    console.log(
      `Triggering faculty transcript generation: semesterId=${SEMESTER_ID}, facultyId=${FACULTY_ID}, schema=${SCHEMA_NAME}`
    );

    const summary = await TranscriptService.GenerateFacultySemesterTranscripts(
      SEMESTER_ID,
      FACULTY_ID,
      SCHEMA_NAME
    );

    console.log("Generation summary:", JSON.stringify(summary, null, 2));
    console.log("✓ Transcripts enqueued. Monitor the worker logs for progress.");
  } catch (err: any) {
    console.error("Error triggering generation:", err.message || err);
    process.exit(1);
  }
})();
