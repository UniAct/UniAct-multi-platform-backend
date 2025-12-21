import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import UniversityValidator from "../Validators/UniversityValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import UniversityController from "../Controllers/UniversityController";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     University:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the university
 *         name:
 *           type: string
 *           description: Name of the university
 *         address:
 *           type: string
 *           nullable: true
 *           description: Physical address of the university
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Contact phone number
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Official email address
 *         website:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: Official website URL
 *         established_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date when the university was established
 *         accreditation:
 *           type: string
 *           nullable: true
 *           description: Accreditation information
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
 *         address: "123 University Street, Alexandria, Egypt"
 *         phone: "+20 3 1234567"
 *         email: "info@anu.edu.eg"
 *         website: "https://www.anu.edu.eg"
 *         established_date: "1942-08-23T00:00:00Z"
 *         accreditation: "NAQAAE Accredited"
 *         created_at: "2025-01-15T10:30:00Z"
 *         updated_at: "2025-01-15T10:30:00Z"
 *
 *     CreateUniversityRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the university (required)
 *         address:
 *           type: string
 *           description: Physical address (optional)
 *         phone:
 *           type: string
 *           description: Contact phone number (optional)
 *         email:
 *           type: string
 *           format: email
 *           description: Official email address (optional)
 *         website:
 *           type: string
 *           format: uri
 *           description: Official website URL (optional)
 *         established_date:
 *           type: string
 *           format: date
 *           description: Date when university was established in ISO 8601 format (optional)
 *         accreditation:
 *           type: string
 *           description: Accreditation information (optional)
 *       example:
 *         name: "Alexandria National University"
 *         address: "123 University Street, Alexandria, Egypt"
 *         phone: "+20 3 1234567"
 *         email: "info@anu.edu.eg"
 *         website: "https://www.anu.edu.eg"
 *         established_date: "1942-08-23"
 *         accreditation: "NAQAAE Accredited"
 *
 *     AssignTenantRequest:
 *       type: object
 *       required:
 *         - tenant_id
 *         - university_id
 *       properties:
 *         tenant_id:
 *           type: integer
 *           minimum: 1
 *           description: ID of the tenant to assign
 *         university_id:
 *           type: integer
 *           minimum: 1
 *           description: ID of the university to associate with the tenant
 *       example:
 *         tenant_id: 1
 *         university_id: 1
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
 *   - name: Universities
 *     description: University management endpoints for creating and managing educational institutions
 */

/**
 * @swagger
 * /university/create:
 *   post:
 *     summary: Create a new university
 *     description: |
 *       Creates a new university record in the system with optional contact and accreditation information.
 *       
 *       **Fields:**
 *       - **name** (required): University name - must be unique
 *       - **address** (optional): Physical location
 *       - **phone** (optional): Contact number
 *       - **email** (optional): Must be valid email format
 *       - **website** (optional): Must be valid URL
 *       - **established_date** (optional): ISO 8601 date format
 *       - **accreditation** (optional): Accreditation details
 *       
 *       Requires super admin authentication.
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUniversityRequest'
 *     responses:
 *       201:
 *         description: University created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "University created successfully!"
 *                     data:
 *                       $ref: '#/components/schemas/University'
 *       400:
 *         description: Validation error or university name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 message: "University with name 'Alexandria National University' already exists."
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
router.post(
  "/create",
  ...UniversityValidator.Create(),
  ValidateRequest,
  UniversityController.Create
);

/**
 * @swagger
 * /university:
 *   get:
 *     summary: Get all universities
 *     description: |
 *       Retrieves a list of all universities registered in the system.
 *       Returns complete university information including contact details and accreditation status.
 *       
 *       Requires super admin authentication.
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Universities retrieved successfully
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
 *                         $ref: '#/components/schemas/University'
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
router.get("/", UniversityController.GetAll);

/**
 * @swagger
 * /university/{id}:
 *   get:
 *     summary: Get a university by ID
 *     description: |
 *       Retrieves detailed information about a specific university by its ID.
 *       
 *       Requires super admin authentication.
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: University ID (positive integer)
 *     responses:
 *       200:
 *         description: University retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/University'
 *       400:
 *         description: Invalid university ID parameter
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
 *         description: University not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 message: "University with Id 99 not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *   delete:
 *     summary: Delete a university
 *     description: |
 *       Deletes a university record from the system.
 *       
 *       ⚠️ **Warning:** This operation will remove the university record. Ensure there are no critical dependencies.
 *       
 *       Requires super admin authentication.
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: University ID (positive integer)
 *     responses:
 *       200:
 *         description: University deleted successfully
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
 *                           example: "University 'Alexandria National University' deleted successfully."
 *                         deletedUniversity:
 *                           $ref: '#/components/schemas/University'
 *       400:
 *         description: Invalid university ID parameter
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
 *         description: University not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               data:
 *                 message: "University with ID 99 not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/:id",
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.GetById
);

router.delete(
  "/:id",
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.Delete
);

/**
 * @swagger
 * /university/assign:
 *   put:
 *     summary: Assign a tenant to a university
 *     description: |
 *       Associates a tenant with a university and performs critical initialization:
 *       
 *       **Operations performed:**
 *       1. Validates that both tenant and university exist
 *       2. Links the tenant to the university
 *       3. Activates the tenant (`is_active: true`)
 *       4. **Creates the tenant's database schema** using SchemaManager
 *       5. Sets up the isolated database environment for the tenant
 *       
 *       **Important:** This endpoint triggers database schema creation, which is essential
 *       for the multi-tenant architecture. The schema will be created based on the tenant's
 *       `db_schema` field and will be isolated from other tenants.
 *       
 *       Requires super admin authentication.
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTenantRequest'
 *     responses:
 *       200:
 *         description: Tenant assigned to university successfully and schema created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Tenant assigned to university successfully."
 *                     data:
 *                       type: object
 *                       description: Updated tenant object with university association
 *       400:
 *         description: Validation error, tenant not found, or university not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             examples:
 *               tenantNotFound:
 *                 value:
 *                   status: "fail"
 *                   data:
 *                     message: "Tenant with ID 99 not found."
 *               universityNotFound:
 *                 value:
 *                   status: "fail"
 *                   data:
 *                     message: "University with ID 99 not found."
 *               validationError:
 *                 value:
 *                   status: "fail"
 *                   data:
 *                     message: "Tenant ID must be a positive integer"
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
 *         description: Internal server error (could be database schema creation failure)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.put(
  "/assign",
  ...UniversityValidator.AssignTenant(),
  ValidateRequest,
  UniversityController.AssignTenant
);

/**
 * @swagger
 * /university/*:
 *   all:
 *     summary: Handle undefined routes
 *     description: Returns 404 for any undefined routes under /university
 *     tags: [Universities]
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