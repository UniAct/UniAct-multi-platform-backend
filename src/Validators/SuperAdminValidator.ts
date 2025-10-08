import { body, param } from "express-validator";

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
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
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
}

export default SuperAdminValidator;
