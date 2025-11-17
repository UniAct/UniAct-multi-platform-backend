import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import TenantValidator from "../Validators/TenantValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import TenantController from "../Controllers/TenantController";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the tenant
 *         name:
 *           type: string
 *           description: Name of the tenant organization
 *         subdomain:
 *           type: string
 *           description: Unique subdomain identifier for the tenant
 *         db_schema:
 *           type: string
 *           description: Database schema name for tenant data isolation
 *         is_active:
 *           type: boolean
 *           description: Tenant activation status
 *         university_id:
 *           type: integer
 *           nullable: true
 *           description: Associated university ID (if applicable)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: 1
 *         name: "Alexandria National University"
 *         subdomain: "anu"
 *         db_schema: "alexandria_national_university"
 *         is_active: true
 *         university_id: 1
 *         created_at: "2025-01-15T10:30:00Z"
 *         updated_at: "2025-01-15T10:30:00Z"
 *
 *     CreateTenantRequest:
 *       type: object
 *       required:
 *         - name
 *         - subdomain
 *         - db_schema
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           pattern: '^[a-zA-Z0-9_\-\s]+$'
 *           description: Tenant name (letters, numbers, spaces, underscores, hyphens)
 *         subdomain:
 *           type: string
 *           minLength: 2
 *           pattern: '^[a-z0-9-]+$'
 *           description: Unique subdomain (lowercase letters, numbers, hyphens only)
 *         db_schema:
 *           type: string
 *           minLength: 3
 *           pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$'
 *           description: Database schema name (must start with letter/underscore, followed by alphanumeric/underscores)
 *       example:
 *         name: "Alexandria National University"
 *         subdomain: "anu"
 *         db_schema: "alexandria_national_university"
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
 *       description: JWT token obtained from super admin login
 */

/**
 * @swagger
 * tags:
 *   - name: Tenants
 *     description: Multi-tenant management endpoints for creating and managing isolated tenant environments
 */

/**
 * @swagger
 * /tenant/create:
 *   post:
 *     summary: Create a new tenant
 *     description: |
 *       Creates a new tenant organization with isolated database schema and subdomain.
 *       This endpoint also registers the tenant domain in the hosts file (development only)
 *       and sets up the tenant's database schema for data isolation.
 *       
 *       **Domain Registration:**
 *       - Development: Registers domain as `www.{subdomain}.local` in system hosts file
 *       - Production: Uses configured BASE_DOMAIN (e.g., `{subdomain}.example.com`)
 *       
 *       Requires super admin authentication.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTenantRequest'
 *     responses:
 *       201:
 *         description: Tenant created successfully with domain registered and schema initialized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Tenant created successfully!"
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Validation error - invalid tenant data format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Not authorized - requires super admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       409:
 *         description: Conflict - subdomain already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 message: "Subdomain already in use."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/create",
  IsAuthenticated,
  IsSuperAdmin,
  ...TenantValidator.Create(),
  ValidateRequest,
  TenantController.Create
);

/**
 * @swagger
 * /tenant:
 *   get:
 *     summary: Get all tenants
 *     description: |
 *       Retrieves a list of all tenant organizations in the system.
 *       Returns complete tenant information including subdomain, schema names, and activation status.
 *       
 *       Requires super admin authentication.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
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
 *                         $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Not authorized - requires super admin role
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
router.get("/", IsAuthenticated, IsSuperAdmin, TenantController.GetAll);

/**
 * @swagger
 * /tenant/{id}:
 *   get:
 *     summary: Get a tenant by ID
 *     description: |
 *       Retrieves detailed information about a specific tenant by its ID.
 *       
 *       Requires super admin authentication.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Tenant ID (positive integer)
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Invalid tenant ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Not authorized - requires super admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 message: "Tenant with id 99 not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *   delete:
 *     summary: Delete a tenant
 *     description: |
 *       Deletes a tenant organization and performs cleanup operations:
 *       - Removes tenant from database
 *       - Removes domain from hosts file (development only)
 *       - Note: Database schema is NOT automatically dropped for safety
 *       
 *       ⚠️ **Warning:** This is a destructive operation. Ensure proper backups exist.
 *       
 *       Requires super admin authentication.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Tenant ID (positive integer)
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: "Tenant 'Alexandria National University' deleted successfully."
 *                         tenant:
 *                           $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Invalid tenant ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Not authorized - requires super admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 message: "Tenant with ID 99 not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...TenantValidator.IdParam(),
  ValidateRequest,
  TenantController.GetById
);

router.delete(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...TenantValidator.IdParam(),
  ValidateRequest,
  TenantController.Delete
);

/**
 * @swagger
 * /tenant/*:
 *   all:
 *     summary: Handle undefined routes
 *     description: Returns 404 for any undefined routes under /tenant
 *     tags: [Tenants]
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