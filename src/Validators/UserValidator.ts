import { body, param } from "express-validator";
import { ValidatePassword } from "./PasswordPolicy";

export default class UserValidator {

  public static Login() {
    return [
      body("email")
        .exists({ checkFalsy: true })
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Email must be a valid email address."),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
    ];
  }

  public static IdParam(entityName: string = "Resource") {
    return [
      param("id")
        .exists().withMessage(`${entityName} ID is required`)
        .bail()
        .notEmpty().withMessage(`${entityName} ID cannot be empty`)
        .bail()
        .isInt({ min: 1 })
        .withMessage(`${entityName} ID must be a positive integer`),
    ];
  }

  public static CreateStaffAccount() {
    return [
      body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 100 }).withMessage("Username must be between 3 and 100 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores")
        .trim(),

      body("first_name")
        .notEmpty().withMessage("First name is required")
        .isLength({ max: 100 }).withMessage("First name must not exceed 100 characters")
        .trim(),

      body("last_name")
        .notEmpty().withMessage("Last name is required")
        .isLength({ max: 100 }).withMessage("Last name must not exceed 100 characters")
        .trim(),

      body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .isLength({ max: 320 }).withMessage("Email must not exceed 320 characters")
        .normalizeEmail(),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .custom((value) => {
          const error = ValidatePassword(value);
          if (error)
            throw new Error(error);
          return true;
        }),

      body("role_names")
        .isArray({ min: 1 }).withMessage("At least one role must be selected")
        .custom((roles) =>
          Array.isArray(roles) && roles.every((role) => typeof role === "string" && role.trim().length > 0)
        )
        .withMessage("role_names must be a non-empty array of role names"),

      body("phone")
        .notEmpty().withMessage("Phone is required")
        .isMobilePhone("any").withMessage("Invalid phone number"),

      body("date_of_birth")
        .notEmpty().withMessage("Date of birth is required")
        .isISO8601().withMessage("Invalid date format, must be YYYY-MM-DD"),

      body("address")
        .notEmpty().withMessage("Address is required")
        .isLength({ max: 255 }).withMessage("Address must not exceed 255 characters"),

      body("city")
        .notEmpty().withMessage("City is required")
        .isLength({ max: 100 }).withMessage("City must not exceed 100 characters"),

      body("country")
        .notEmpty().withMessage("Country is required")
        .isLength({ max: 100 }).withMessage("Country must not exceed 100 characters"),

      body("national_id")
        .notEmpty().withMessage("National ID is required")
        .isLength({ min: 14, max: 14 }).withMessage("National ID must be 14 digits")
        .matches(/^[0-9]+$/).withMessage("National ID must contain only numbers"),

      body("position")
        .notEmpty().withMessage("Position is required")
        .isLength({ max: 100 }).withMessage("Position must not exceed 100 characters"),

      body("hireDate")
        .notEmpty().withMessage("Hire date is required")
        .isISO8601().withMessage("Invalid hire date format (must be YYYY-MM-DD)"),

      body("salary")
        .optional()
        .isDecimal({ decimal_digits: "0,2" })
        .withMessage("Salary must be a valid decimal number"),
    ];
  }

  public static UpdateCurrentUserProfile() {
    const updatableFields = [
      "username",
      "firstName",
      "lastName",
      "email",
      "phone",
      "dateOfBirth",
      "address",
      "city",
      "country",
      "nationalId",
      "fullname",
      "homePhone",
      "position",
    ];

    return [
      body()
        .custom((value) => {
          const hasAnyField =
            value &&
            typeof value === "object" &&
            updatableFields.some((field) => value[field] !== undefined);

          if (!hasAnyField) {
            throw new Error("At least one profile field is required");
          }

          return true;
        }),

      body("username")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage("Username must be between 3 and 100 characters")
        .matches(/^[a-zA-Z0-9_.-]+$/).withMessage("Username can only contain letters, numbers, dots, underscores, and hyphens")
        .trim(),

      body("firstName")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("First name must be between 2 and 100 characters")
        .trim(),

      body("lastName")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("Last name must be between 2 and 100 characters")
        .trim(),

      body("email")
        .optional()
        .isEmail().withMessage("Invalid email format")
        .isLength({ max: 320 }).withMessage("Email must not exceed 320 characters")
        .normalizeEmail(),

      body("phone")
        .optional()
        .isMobilePhone("any").withMessage("Invalid phone number"),

      body("dateOfBirth")
        .optional()
        .isISO8601().withMessage("Invalid date format, must be YYYY-MM-DD"),

      body("address")
        .optional()
        .isLength({ min: 5, max: 255 }).withMessage("Address must be between 5 and 255 characters"),

      body("city")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("City must be between 2 and 100 characters"),

      body("country")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("Country must be between 2 and 100 characters"),

      body("nationalId")
        .optional()
        .isLength({ min: 14, max: 14 }).withMessage("National ID must be 14 digits")
        .matches(/^[0-9]+$/).withMessage("National ID must contain only numbers"),

      body("fullname")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters")
        .trim(),

      body("homePhone")
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 20 }).withMessage("Home phone must not exceed 20 characters"),

      body("position")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("Position must be between 2 and 100 characters")
        .trim(),
    ];
  }

  public static ChangeCurrentUserPassword() {
    return [
      body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

      body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .custom((value) => {
          const error = ValidatePassword(value);
          if (error)
            throw new Error(error);
          return true;
        }),

      body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error("Confirm password must match the new password");
          }
          return true;
        }),
    ];
  }

  public static UpdateStaffAccount() {
    const updatableFields = [
      "username",
      "first_name",
      "last_name",
      "email",
      "password",
      "phone",
      "date_of_birth",
      "address",
      "city",
      "country",
      "national_id",
      "position",
      "role_names",
      "hireDate",
      "salary",
    ];

    return [
      body()
        .custom((value) => {
          const hasAnyField =
            value &&
            typeof value === "object" &&
            updatableFields.some((field) => value[field] !== undefined);

          if (!hasAnyField) {
            throw new Error("At least one field is required to update staff account");
          }

          return true;
        }),

      body("username")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage("Username must be between 3 and 100 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores")
        .trim(),

      body("first_name")
        .optional()
        .isLength({ max: 100 }).withMessage("First name must not exceed 100 characters")
        .trim(),

      body("last_name")
        .optional()
        .isLength({ max: 100 }).withMessage("Last name must not exceed 100 characters")
        .trim(),

      body("email")
        .optional()
        .isEmail().withMessage("Invalid email format")
        .isLength({ max: 320 }).withMessage("Email must not exceed 320 characters")
        .normalizeEmail(),

      body("password")
        .optional()
        .custom((value) => {
          const error = ValidatePassword(value);
          if (error)
            throw new Error(error);
          return true;
        }),

      body("phone")
        .optional()
        .isMobilePhone("any").withMessage("Invalid phone number"),

      body("date_of_birth")
        .optional()
        .isISO8601().withMessage("Invalid date format, must be YYYY-MM-DD"),

      body("address")
        .optional()
        .isLength({ max: 255 }).withMessage("Address must not exceed 255 characters"),

      body("city")
        .optional()
        .isLength({ max: 100 }).withMessage("City must not exceed 100 characters"),

      body("country")
        .optional()
        .isLength({ max: 100 }).withMessage("Country must not exceed 100 characters"),

      body("national_id")
        .optional()
        .isLength({ min: 14, max: 14 }).withMessage("National ID must be 14 digits")
        .matches(/^[0-9]+$/).withMessage("National ID must contain only numbers"),

      body("position")
        .optional()
        .isLength({ max: 100 }).withMessage("Position must not exceed 100 characters"),

      body("hireDate")
        .optional()
        .isISO8601().withMessage("Invalid hire date format (must be YYYY-MM-DD)"),

      body("salary")
        .optional()
        .isDecimal({ decimal_digits: "0,2" })
        .withMessage("Salary must be a valid decimal number"),
    ];
  }
}
