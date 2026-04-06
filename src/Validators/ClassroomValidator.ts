import { body, param } from "express-validator";

export default class ClassroomValidator {
  public static Create() {
    return [
      body("roomNumber")
        .notEmpty()
        .withMessage("Room number is required")
        .isString()
        .isLength({ max: 50 }),

      body("building")
        .notEmpty()
        .withMessage("Building is required")
        .isString()
        .isLength({ max: 100 }),

      body("capacity")
        .isInt({ gt: 0 })
        .withMessage("Capacity must be a positive integer")
        .toInt(),

      body("type")
        .notEmpty()
        .withMessage("Classroom type is required")
        .isIn(["Lecture", "Lab", "Auditorium", "Other"]),

      body("isAvailable")
        .optional()
        .isBoolean()
        .toBoolean(),
    ];
  }

  public static Update() {
    return [...this.IdParam(), ...this.Create()];
  }

  public static IdParam() {
    return [
      param("id")
        .exists()
        .withMessage("Classroom ID is required")
        .isInt({ gt: 0 })
        .withMessage("Classroom ID must be a positive integer")
        .toInt(),
    ];
  }
}