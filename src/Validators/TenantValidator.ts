import { body, param } from "express-validator";

export default class TenantValidator {
  public static Create() {
    return [
      body("name")
        .notEmpty()
        .withMessage("Tenant name is required")
        .isLength({ min: 3 })
        .withMessage("Tenant name must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9_\-\s]+$/)
        .withMessage("Tenant name may only contain letters, numbers, spaces, underscores, and hyphens"),

      body("subdomain")
        .notEmpty()
        .withMessage("Subdomain is required")
        .isLength({ min: 2 })
        .withMessage("Subdomain must be at least 2 characters long")
        .matches(/^[a-z0-9-]+$/)
        .withMessage("Subdomain may only contain lowercase letters, numbers, and hyphens"),

      body("db_schema")
        .notEmpty()
        .withMessage("Database schema is required")
        .isLength({ min: 3 })
        .withMessage("Database schema name must be at least 3 characters long")
        .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
        .withMessage("Database schema must start with a letter or underscore, followed by letters, digits, or underscores"),
    ];
  }

  public static IdParam() {
    return [
      param("id")
        .notEmpty()
        .withMessage("Tenant ID parameter is required")
        .isInt({ gt: 0 })
        .withMessage("Tenant ID must be a positive integer"),
    ];
  }
}
