import axios from "axios";

(async () => {
  const SEMESTER_ID = 12;
  const FACULTY_ID = 4;
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

  try {
    console.log(`Triggering faculty transcript generation for semesterId=${SEMESTER_ID}, facultyId=${FACULTY_ID}`);
    console.log(`API URL: ${API_BASE_URL}/transcripts/semesters/${SEMESTER_ID}/faculties/${FACULTY_ID}/generate`);

    const response = await axios.post(
      `${API_BASE_URL}/transcripts/semesters/${SEMESTER_ID}/faculties/${FACULTY_ID}/generate`,
      {
        schema: "anu", // Tenant schema
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message || err);
    process.exit(1);
  }
})();
