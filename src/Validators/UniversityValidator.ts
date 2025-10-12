import { body, param } from "express-validator";

export default class UniversityValidator {

  public static Create() {
    return [
      body("name")
        .exists({ checkFalsy: true })
        .withMessage("University name is required.")
        .isString()
        .withMessage("University name must be a string."),

      body("address")
        .optional()
        .isString()
        .withMessage("Address must be a string."),

      body("phone")
        .optional()
        .isString()
        .withMessage("Phone must be a string."),

      body("email")
        .optional()
        .isEmail()
        .withMessage("Email must be a valid email address."),

      body("website")
        .optional()
        .isURL()
        .withMessage("Website must be a valid URL."),

      body("established_date")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("Established date must be a valid date."),

      body("accreditation")
        .optional()
        .isString()
        .withMessage("Accreditation must be a string."),
    ];
  }

  public static IdParam() {
    return [
      param("id")
        .exists()
        .withMessage("University ID is required.")
        .isInt({ gt: 0 })
        .withMessage("University ID must be a positive integer.")
        .toInt(),
    ];
  }

  public static AssignTenant() {
    return [
      body("tenant_id")
        .notEmpty()
        .withMessage("Tenant ID cannot be empty")
        .bail() 
        .isInt({ gt: 0 })
        .withMessage("Tenant ID must be a positive integer")
        .toInt(),

      body("university_id")
        .notEmpty()
        .withMessage("University ID cannot be empty")
        .bail()
        .isInt({ gt: 0 })
        .withMessage("University ID must be a positive integer")
        .toInt(),
    ];
  }
}
