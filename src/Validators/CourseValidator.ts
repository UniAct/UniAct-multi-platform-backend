import { body, param } from "express-validator";

export default class CourseValidator {
  public static Create() {
    return [
      body("name")
        .notEmpty()
        .withMessage("Course name is required")
        .isString()
        .isLength({ max: 255 }),

      body("code")
        .notEmpty()
        .withMessage("Course code is required")
        .isString()
        .isLength({ max: 20 }),

      body("credits")
        .isInt({ gt: 0 })
        .withMessage("Credits must be a positive integer")
        .toInt(),

      body("programId")
        .isInt({ gt: 0 })
        .withMessage("Program ID must be a positive integer")
        .toInt(),

      body("description")
        .optional()
        .isString(),

      body("syllabus")
        .optional()
        .isString(),

      body("successPercentage")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .toFloat(),

      body("minFinalSuccessPercentage")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .toFloat(),

      body("courseType")
        .optional()
        .isIn(["Mandatory", "Elective", "Project"]),

      body("prerequisiteIds")
        .optional()
        .isArray(),
    ];
  }

  public static Update() {
    return [...this.IdParam(), ...this.Create()];
  }

  public static IdParam() {
    return [
      param("id")
        .exists()
        .withMessage("Course ID is required")
        .isInt({ gt: 0 })
        .withMessage("Course ID must be a positive integer")
        .toInt(),
    ];
  }
}
