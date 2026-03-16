import { body, param } from "express-validator";
import { ValidatePassword } from "./PasswordPolicy";

class SuperAdminValidator {
  public static CreateSuperAdmin() {
    return [
      body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),

      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

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

  public static UsernameParam() {
    return [
      param("username")
        .notEmpty()
        .withMessage("Username parameter is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),
    ];
  }

  public static Login() {
    return [
      body("email")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),
      
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

  public static AssignRootAccount() {
    return [
      body("university_name")
        .notEmpty()
        .withMessage("University name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("university name must be between 2 and 100 characters")
        .trim(),

      body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Username must be between 3 and 100 characters")
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage("Username can only contain letters, numbers, underscores, and hyphens"),

      body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("First name must be between 2 and 100 characters")
        .trim(),

      body("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Last name must be between 2 and 100 characters")
        .trim(),

      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .isLength({ max: 320 })
        .withMessage("Email must not exceed 320 characters")
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
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage("Invalid phone number format (E.164 format recommended)")
        .isLength({ max: 15 })
        .withMessage("Phone number must not exceed 15 characters"),

      body("dateOfBirth")
        .notEmpty()
        .withMessage("Date of birth is required")
        .isISO8601()
        .withMessage("Invalid date format (use ISO 8601: YYYY-MM-DD)")
        .custom((value) => {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const minAge = 18;
          const maxAge = 100;
          
          if (age < minAge) {
            throw new Error(`User must be at least ${minAge} years old`);
          }
          if (age > maxAge) {
            throw new Error(`Invalid date of birth`);
          }
          if (birthDate > today) {
            throw new Error("Date of birth cannot be in the future");
          }
          return true;
        }),

      body("address")
        .notEmpty()
        .withMessage("Address is required")
        .isString()
        .withMessage("Address must be a string")
        .trim(),

      body("city")
        .notEmpty()
        .withMessage("City is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("City must be between 2 and 100 characters")
        .trim(),

      body("country")
        .notEmpty()
        .withMessage("Country is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Country must be between 2 and 100 characters")
        .trim(),

      body("nationalId")
        .notEmpty()
        .withMessage("National ID is required")
        .isLength({ min: 5, max: 50 })
        .withMessage("National ID must be between 5 and 50 characters")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("National ID can only contain letters and numbers")
        .trim(),
    ];
  }
}

export default SuperAdminValidator;
