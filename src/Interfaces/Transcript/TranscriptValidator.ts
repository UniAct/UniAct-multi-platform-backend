import { param } from "express-validator";

export default class TranscriptValidator {
  public static StudentIdParam() {
    return [
      param("studentId")
        .exists()
        .withMessage("Student ID is required")
        .isInt({ gt: 0 })
        .withMessage("Student ID must be a positive integer")
        .toInt(),
    ];
  }

  public static SemesterIdParam() {
    return [
      param("semesterId")
        .exists()
        .withMessage("Semester ID is required")
        .isInt({ gt: 0 })
        .withMessage("Semester ID must be a positive integer")
        .toInt(),
    ];
  }

  public static GenerateStudentTranscript() {
    return [...this.StudentIdParam(), ...this.SemesterIdParam()];
  }

  public static GenerateSemesterTranscripts() {
    return [...this.SemesterIdParam()];
  }

  public static GenerateSemesterTranscriptsByFaculty() {
    return [
      ...this.SemesterIdParam(),
      param("facultyId")
        .exists()
        .withMessage("Faculty ID is required")
        .isInt({ gt: 0 })
        .withMessage("Faculty ID must be a positive integer")
        .toInt(),
    ];
  }

  public static StudentSemesterParams() {
    return [...this.StudentIdParam(), ...this.SemesterIdParam()];
  }
}
