// SuperAdminRoutes.ts
import { Router } from "express";
import SuperAdminController from "../Controllers/SuperAdminController";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import { ValidateToken } from "../Middlewares/ValidationToken";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SuperAdmin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the super admin
 *         username:
 *           type: string
 *           description: The super admin's username
 *         email:
 *           type: string
 *           format: email
 *           description: The super admin's email address
 *         is_active:
 *           type: boolean
 *           description: Whether the super admin account is activated
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *       example:
 *         id: 1
 *         username: admin_user
 *         email: admin@university.edu
 *         is_active: true
 *         created_at: 2025-01-15T10:30:00Z
 *
 *     JSendSuccess:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         data:
 *           type: object
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
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication. Include as "Bearer {token}"
 *
 * tags:
 *   - name: SuperAdmin
 *     description: Super administrator management endpoints
 */

/**
 * Routes under this section implement Discretionary Access Control (DAC)
 * through the SuperAdmin role. Only users with the "SuperAdmin" role
 * can access or manage these endpoints.
 */

/**
 * @swagger
 * /api/super-admin/register:
 *   post:
 *     summary: Register a new super admin
 *     description: Creates a new super admin account and sends a verification email. Requires authentication and super admin privileges.
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: Unique username for the super admin
 *                 example: john_admin
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *                 example: john.admin@university.edu
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Strong password meeting policy requirements
 *                 example: SecurePass123!
 *     responses:
 *       201:
 *         description: SuperAdmin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: SuperAdmin created and confirmation email sent!
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Not authorized (not a super admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/register",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.CreateSuperAdmin(),
  ValidateRequest,
  SuperAdminController.Register
);

/**
 * @swagger
 * /api/super-admin/verify/{token}:
 *   get:
 *     summary: Verify and activate super admin account
 *     description: Activates a super admin account using the verification token sent via email
 *     tags: [SuperAdmin]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent via email
 *     responses:
 *       200:
 *         description: Account activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "SuperAdmin 'john_admin' activated successfully."
 *       400:
 *         description: Invalid token payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: SuperAdmin not found
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
router.get("/verify/:token", ValidateToken, SuperAdminController.Activate);

/**
 * @swagger
 * /api/super-admin/verify-root-account/{token}:
 *   get:
 *     summary: Verify and activate root account
 *     description: Activates a root account for a specific university using the verification token
 *     tags: [SuperAdmin]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent via email
 *     responses:
 *       200:
 *         description: Root account activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Root account for Alexandria National University activated successfully."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get(
  "/verify-root-account/:token",
  ValidateToken,
  SuperAdminController.ActivateRootAccount
);

/**
 * @swagger
 * /api/super-admin/login:
 *   post:
 *     summary: Super admin login
 *     description: Authenticates a super admin and returns a JWT token
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 3
 *                 description: Super admin email address
 *                 example: admin@university.edu
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Super admin password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: john_admin
 *                         email:
 *                           type: string
 *                           example: admin@university.edu
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Account not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: SuperAdmin not found
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
  "/login",
  ...SuperAdminValidator.Login(),
  ValidateRequest,
  SuperAdminController.Login
);

/**
 * @swagger
 * /api/super-admin:
 *   get:
 *     summary: Get all super admins
 *     description: Retrieves a list of all super admin accounts. Requires authentication and super admin privileges.
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of super admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SuperAdmin'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Invalid or expired token / Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get("/", IsAuthenticated, IsSuperAdmin, SuperAdminController.GetAll);

/**
 * @swagger
 * /api/super-admin/{username}:
 *   delete:
 *     summary: Delete a super admin
 *     description: Deletes a super admin account by username. Requires authentication and super admin privileges.
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *         description: The username of the super admin to delete
 *     responses:
 *       200:
 *         description: SuperAdmin deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "SuperAdmin 'john_admin' deleted successfully."
 *                     admin:
 *                       $ref: '#/components/schemas/SuperAdmin'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Invalid or expired token / Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *       404:
 *         description: SuperAdmin not found
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
  "/:username",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.UsernameParam(),
  ValidateRequest,
  SuperAdminController.Delete
);

/**
 * @swagger
 * /api/super-admin/assign-root-account:
 *   post:
 *     summary: Assign a root account to a university
 *     description: Creates a root account with full permissions for a specific university tenant. The account is created with the RootAccount role and assigned default RBAC and Account management permissions. Requires authentication and super admin privileges.
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - university_name
 *               - username
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - phone
 *               - date_of_birth
 *               - address
 *               - city
 *               - country
 *               - national_id
 *             properties:
 *               university_name:
 *                 type: string
 *                 description: Name of the university tenant
 *                 example: Alexandria National University
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *                 description: Unique username (letters, numbers, underscores, hyphens only)
 *                 example: root_admin
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: First name of the root account user
 *                 example: Ahmed
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Last name of the root account user
 *                 example: Hassan
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 320
 *                 description: Valid email address
 *                 example: root@alexandria.edu.eg
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Strong password meeting policy requirements
 *                 example: SecureRootPass123!
 *               phone:
 *                 type: string
 *                 maxLength: 15
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 description: Phone number in E.164 format
 *                 example: +201234567890
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth in ISO 8601 format (YYYY-MM-DD). User must be 18-100 years old.
 *                 example: 1985-05-15
 *               address:
 *                 type: string
 *                 description: Street address
 *                 example: 123 University Street
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: City name
 *                 example: Alexandria
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Country name
 *                 example: Egypt
 *               national_id:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z0-9]+$'
 *                 description: National ID (letters and numbers only)
 *                 example: 29505151234567
 *     responses:
 *       201:
 *         description: Root account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Root Account Created And Confirmation email sent!
 *       400:
 *         description: Validation error or university/user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: Invalid or expired token / Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/assign-root-account",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.AssignRootAccount(),
  ValidateRequest,
  SuperAdminController.AssignRootAccount
);

router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;