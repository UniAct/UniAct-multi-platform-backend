import { SemesterType } from "@prisma/client";
import { body, param } from "express-validator";

export default class SemesterValidator {

  public static Create() {
    return [
      body("year")
        .exists().withMessage("Year is required")
        .isInt({ min: 2000, max: 2100 }).withMessage("Year must be between 2000 and 2100")
        .toInt(),

      body("number")
        .exists().withMessage("Semester number is required")
        .isInt({ min: 1, max: 3 }).withMessage("Semester number must be between 1 and 3 (1: )")
        .toInt(),

      body("startDate")
        .exists().withMessage("Start date is required")
        .isISO8601().withMessage("Start date must be in a valid format (YYYY-MM-DD)")
        .toDate(),

      body("endDate")
        .exists().withMessage("End date is required")
        .isISO8601().withMessage("End date must be in a valid format (YYYY-MM-DD)")
        .toDate()
        .custom((endDate, { req }) => {
          if (req.body.startDate && endDate <= req.body.startDate) {
            throw new Error("End date must be after start date");
          }
          return true;
        }),
    ];
  }

  public static IdParam() {
    return [
      param("id")
        .exists()
        .withMessage("Semester ID is required")
        .isInt({ gt: 0 })
        .withMessage("Semester ID must be a positive integer")
        .toInt(),
    ];
  }

  public static Update() {
    return [
      ...this.IdParam(),
      body("year")
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage("Year must be between 2000 and 2100")
        .toInt(),

      body("number")
        .optional()
        .isInt({ min: 1, max: 3 })
        .withMessage("Semester number must be between 1 and 4")
        .toInt(),

      body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be in a valid format (YYYY-MM-DD)")
        .toDate(),

      body("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be in a valid format (YYYY-MM-DD)")
        .toDate()
        .custom((endDate, { req }) => {
          if (req.body.startDate && endDate && endDate <= req.body.startDate) {
            throw new Error("End date must be after start date");
          }
          return true;
        })
    ];
  }
}