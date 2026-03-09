import { body, param } from "express-validator";

export default class FacultyValidator {

  public static Create() {
    return [
      body("universityId")
        .exists()
        .withMessage("University ID is required")
        .isInt({ gt: 0 })
        .withMessage("University ID must be a positive integer")
        .toInt(),

      body("name")
        .exists({ checkFalsy: true })
        .withMessage("Faculty name is required")
        .isString()
        .withMessage("Faculty name must be a string")
        .isLength({ max: 255 })
        .withMessage("Faculty name must be less than 255 characters"),

      body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),

      body("deanId")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("Dean ID must be a positive integer")
        .toInt(),

      body("establishedDate")
        .optional()
        .isISO8601()
        .withMessage("Established date must be in a valid ISO 8601 format (YYYY-MM-DD)")
        .toDate(),
    ];
  }

  public static IdParam() {
    return [
      param("id")
        .exists()
        .withMessage("Faculty ID is required")
        .isInt({ gt: 0 })
        .withMessage("Faculty ID must be a positive integer")
        .toInt(),
    ];
  }
}