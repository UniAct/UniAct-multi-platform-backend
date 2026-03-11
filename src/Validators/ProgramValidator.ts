import { body, param } from "express-validator";

export default class ProgramValidator {

  public static Create() {
  return [
    body("facultyId")
      .isInt({ gt: 0 })
      .withMessage("Faculty ID must be a positive integer")
      .toInt(),

    body("name")
      .notEmpty()
      .withMessage("Program name is required")
      .isString()
      .isLength({ max: 255 }),

    body("description")
      .optional()
      .isString(),

    body("headId")
      .optional()
      .isInt({ gt: 0 })
      .toInt(),

    body("phone")
      .optional()
      .isString(),

    body("universityCreditHours")
      .optional()
      .isInt({ min: 0 })
      .toInt(),

    body("facultyCreditHours")
      .optional()
      .isInt({ min: 0 })
      .toInt(),

    body("programCreditHours")
      .optional()
      .isInt({ min: 0 })
      .toInt(),

    body("programType")
      .notEmpty()
      .withMessage("Program type is required"),

    body("resultDisplay")
      .optional(),
  ];
}

  public static IdParam() {
    return [
      param("id")
        .exists()
        .withMessage("Program ID is required")
        .isInt({ gt: 0 })
        .withMessage("Program ID must be a positive integer")
        .toInt(),
    ];
  }
}