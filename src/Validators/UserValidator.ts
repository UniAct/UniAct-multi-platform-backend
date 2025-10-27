import { body } from "express-validator";
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
        .custom((value) => {
          const error = ValidatePassword(value);
          if (error) 
            throw new Error(error);
          return true;
        }),
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

      body("cv")
        .optional()
        .custom((value, { req }) => {
          if (req.file && req.file.mimetype !== "application/pdf") {
            throw new Error("CV must be a PDF file");
          }
          return true;
        }),
    ];
  }
}
