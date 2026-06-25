(async () => {
  const SEMESTER_ID = Number(process.env.SEMESTER_ID || 12);
  const FACULTY_ID = Number(process.env.FACULTY_ID || 4);
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

  try {
    const url = `${API_BASE_URL}/transcripts/semesters/${SEMESTER_ID}/faculties/${FACULTY_ID}/generate`;
    console.log(`Queueing faculty transcript generation at ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();
