import { body, param } from "express-validator";

export class RBACValidator {
  public static CreateRole() {
    return [
      body("name")
        .notEmpty()
        .withMessage("Role name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Role name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9_\-\s]+$/)
        .withMessage("Role name can only contain letters, numbers, underscores, hyphens, and spaces")
        .trim(),

      body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .isLength({ max: 255 })
        .withMessage("Description must not exceed 255 characters")
        .trim(),
    ];
  }

  public static ValidateIdParam() {
    return [
      param("id").isInt({ min: 1 }).withMessage("User ID must be a positive integer"),
    ];
  }

  public static AssignPermissionsToRole() {
    return [
      param("id")
        .notEmpty()
        .withMessage("Role ID parameter is required")
        .isInt({ gt: 0 })
        .withMessage("Role ID must be a positive integer"),

      body("permissions")
        .isArray({ min: 1 })
        .withMessage("Permissions must be a non-empty array"),
      
      body("permissions.*")
        .isString()
        .withMessage("Each permission must be a string")
        .matches(/^[a-z0-9.\-_]+$/)
        .withMessage("Invalid permission format (allowed: lowercase letters, digits, '.', '-', '_')"),
    ];
  }
}