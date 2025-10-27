import { body, param } from "express-validator";

export class AccountValidator {
  public static AssignRoleToUser() {
    return [
      param("id")
        .isInt({ min: 1 })
        .withMessage("User ID must be a positive integer"),

      body("role_names")
        .isArray({ min: 1 })
        .withMessage("role_names must be a non-empty array"),

      body("role_names.*")
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage("Each role name must be a string between 2 and 100 characters"),
    ];
  }
}
