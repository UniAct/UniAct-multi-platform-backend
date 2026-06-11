import { body, param } from "express-validator";

export default class UniversityValidator {

  public static Create() {
    return [
      body("name")
        .exists({ checkFalsy: true })
        .withMessage("University name is required.")
        .isString()
        .withMessage("University name must be a valid string."),

      body("address")
        .exists({ checkFalsy: true })
        .withMessage("Address is required.")
        .isString()
        .withMessage("Address must be a valid string."),

      body("phone")
        .exists({ checkFalsy: true })
        .withMessage("Phone number is required.")
        .isString()
        .withMessage("Phone number must be a valid string."),

      body("email")
        .exists({ checkFalsy: true })
        .withMessage("Email address is required.")
        .isEmail()
        .withMessage("Please provide a valid email address."),

      body("website")
        .exists({ checkFalsy: true })
        .withMessage("Website is required.")
        .isURL()
        .withMessage("Please provide a valid website URL."),

      body("established_date")
        .exists({ checkFalsy: true })
        .withMessage("Established date is required.")
        .isISO8601()
        .withMessage("Established date must be in ISO 8601 format (YYYY-MM-DD).")
        .toDate(),

      body("accreditation")
        .exists({ checkFalsy: true })
        .withMessage("Accreditation is required.")
        .isString()
        .withMessage("Accreditation must be a valid string."),

      body("db_schema")
        .exists({ checkFalsy: true })
        .isLength({min: 3 , max: 10})
        .withMessage("Database schema is required and its length must be between 3 and 10.")
        .isString()
        .withMessage("Database schema must be a valid string."),
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

  public static UpdateSettings() {
    return [
      body("primary_color")
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage("Must be hex color e.g. #1A3C6E"),

      body("secondary_color")
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage("Must be hex color"),

      body("tab_name")
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 80 })
        .withMessage("Tab name max 80 chars"),

      body("logo_url")
        .optional({ nullable: true })
        .isString()
        .withMessage("Logo URL must be a string"),
    ];
  }
}
