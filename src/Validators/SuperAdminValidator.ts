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
}

export default SuperAdminValidator;
