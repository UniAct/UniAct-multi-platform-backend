import { Router } from "express";
import { RBACValidator } from "../Validators/RBACValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RBACController } from "../Controllers/RBACController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { RBACAuthorization } from "../Middlewares/Authorization/RBACAuthorization";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { AccountValidator } from "../Validators/AccountValidator";
import { AccountAuthorization } from "../Middlewares/Authorization/AccountAuthorization";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the role
 *         name:
 *           type: string
 *           description: The name of the role
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of permission names associated with the role
 *       example:
 *         id: 1
 *         name: "admin"
 *         description: "Administrator role with full access"
 *         createdAt: "2025-01-15T10:30:00Z"
 *         updatedAt: "2025-01-15T10:30:00Z"
 *         permissions: ["rbac.read", "rbac.create", "rbac.update", "rbac.delete"]
 *
 *     Permission:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The unique name of the permission
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of what the permission allows
 *       example:
 *         name: "rbac.read"
 *         description: "Read all roles and permissions"
 *
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           pattern: '^[a-zA-Z0-9_\-\s]+$'
 *           description: Role name (letters, numbers, underscores, hyphens, spaces)
 *         description:
 *           type: string
 *           maxLength: 255
 *           description: Optional role description
 *       example:
 *         name: "content_manager"
 *         description: "Manages content creation and editing"
 *
 *     AssignPermissionsRequest:
 *       type: object
 *       required:
 *         - permissions
 *       properties:
 *         permissions:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: string
 *             pattern: '^[a-z0-9.\-_]+$'
 *           description: Array of permission names to assign
 *       example:
 *         permissions: ["rbac.read", "rbac.create"]
 *
 *     AssignRoleToUserRequest:
 *       type: object
 *       required:
 *         - role_names
 *       properties:
 *         role_names:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of role names to assign to the user
 *       example:
 *         role_names: ["admin", "moderator"]
 *
 *     JSendSuccess:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         data:
 *           type: object
 *         message:
 *           type: string
 *
 *     JSendFail:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail]
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *
 *     JSendError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *         message:
 *           type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   parameters:
 *     TenantHeader:
 *       in: header
 *       name: host
 *       required: true
 *       schema:
 *         type: string
 *       description: Tenant subdomain (e.g., www.anu.local or anu.uniact.edu.eg)
 *       example: www.anu.local
 */

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Role management endpoints
 *   - name: Permissions
 *     description: Permission management endpoints
 *   - name: User Roles
 *     description: User role assignment endpoints
 */

/**
 * @swagger
 * /rbac/role:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role in the tenant's schema. Requires 'rbac.create' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid tenant or missing host header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: Role already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.create' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/role",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasCreatePermission,
  ...RBACValidator.CreateRole(),
  ValidateRequest,
  RBACController.CreateRole
);

/**
 * @swagger
 * /rbac/role/{id}:
 *   get:
 *     summary: Get a role by ID
 *     description: Retrieves a specific role with its associated permissions. Requires 'rbac.read' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.read' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasReadPermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.GetRole
);

/**
 * @swagger
 * /rbac/role:
 *   get:
 *     summary: Get all roles
 *     description: Retrieves all roles in the tenant's schema with their associated permissions. Requires 'rbac.read' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 *       403:
 *         description: Access denied - missing 'rbac.read' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/role",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasReadPermission,
  RBACController.GetAllRole
);

/**
 * @swagger
 * /rbac/role/{id}:
 *   put:
 *     summary: Update a role
 *     description: Updates an existing role's name and/or description. Requires 'rbac.update' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.update' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       409:
 *         description: Role name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role from the tenant's schema. Requires 'rbac.delete' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.delete' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Role does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.put(
  "/role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasUpdatePermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.UpdateRole
);

/**
 * @swagger
 * /api/rbac/role/{id}:
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role from the tenant's schema. Requires 'rbac.delete' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.delete' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Role does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.delete(
  "/role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasDeletePermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.DeleteRole
);

/**
 * @swagger
 * /rbac/permission:
 *   get:
 *     summary: Get all permissions
 *     description: Retrieves all available permissions in the tenant's schema. Requires 'rbac.read' permission.
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Permission'
 *       403:
 *         description: Access denied - missing 'rbac.read' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/permission",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasReadPermission,
  RBACController.ReadPermissions
);

/**
 * @swagger
 * /api/rbac/permission/{id}:
 *   get:
 *     summary: Get a permission by ID
 *     description: Retrieves a specific permission by its ID. Requires 'rbac.delete' permission.
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Invalid permission ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.delete' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/permission/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasDeletePermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.ReadPermissionsById
);

/**
 * @swagger
 * /api/rbac/assign-permissions-to-role/{id}:
 *   post:
 *     summary: Assign permissions to a role
 *     description: Assigns a set of permissions to a specific role. This replaces all existing permissions for the role. Requires 'rbac.create' permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignPermissionsRequest'
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Permissions assigned successfully"
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid request - role ID or permissions format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'rbac.create' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/assign-permissions-to-role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasCreatePermission,
  ...RBACValidator.AssignPermissionsToRole(),
  ValidateRequest,
  RBACController.AssignPermissionsToRole
);

/**
 * @swagger
 * /api/rbac/assign-role-to-user/{id}:
 *   post:
 *     summary: Assign roles to a user
 *     description: Assigns one or more roles to a specific user. This replaces all existing roles for the user. Requires 'account.assign_role' permission.
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRoleToUserRequest'
 *     responses:
 *       200:
 *         description: Roles assigned to user successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Roles assigned to user successfully"
 *                     data:
 *                       type: object
 *                       description: Updated user object with roles
 *       400:
 *         description: Invalid user ID or role names
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Access denied - missing 'account.assign_role' permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/assign-role-to-user/:id",
  TenantResolver,
  IsAuthenticated,
  AccountAuthorization.HasAssignRolePermission,
  ...AccountValidator.AssignRoleToUser(),
  ValidateRequest,
  RBACController.AssignRoleToUser
);

/**
 * @swagger
 * /api/rbac/*:
 *   all:
 *     summary: Handle undefined routes
 *     description: Returns 404 for any undefined routes under /api/rbac
 *     tags: [Roles]
 *     responses:
 *       404:
 *         description: Route not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 route: "Route not found"
 */
router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;