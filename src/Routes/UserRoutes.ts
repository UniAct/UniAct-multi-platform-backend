import { Router } from "express";
import UserValidator from "../Validators/UserValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { UserController } from "../Controllers/UserController";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { upload } from "../Utils/MulterConfiguration";
import { ParseMultipartData } from "../Middlewares/ParseMultipartData";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the user
 *         username:
 *           type: string
 *           description: Unique username
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         country:
 *           type: string
 *           description: Country
 *         nationalId:
 *           type: string
 *           description: National identification number
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: 1
 *         username: "john_doe"
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@anu.edu.eg"
 *         phone: "01234567890"
 *         dateOfBirth: "1990-05-15"
 *         address: "123 Main Street"
 *         city: "Alexandria"
 *         country: "Egypt"
 *         nationalId: "29005151234567"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *       example:
 *         email: "john.doe@anu.edu.eg"
 *         password: "SecureP@ss123"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         message:
 *           type: string
 *           example: "Login successful."
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT authentication token containing user roles and permissions
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *
 *     CreateStaffAccountRequest:
 *       type: object
 *       required:
 *         - username
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *         - phone
 *         - date_of_birth
 *         - address
 *         - city
 *         - country
 *         - national_id
 *         - position
 *         - hireDate
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-zA-Z0-9_]+$'
 *           description: Unique username (letters, numbers, underscores only)
 *         first_name:
 *           type: string
 *           maxLength: 100
 *           description: Staff member's first name
 *         last_name:
 *           type: string
 *           maxLength: 100
 *           description: Staff member's last name
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 320
 *           description: Email address (must be unique)
 *         password:
 *           type: string
 *           format: password
 *           description: Password meeting security policy requirements
 *         phone:
 *           type: string
 *           description: Mobile phone number (any valid international format)
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: Date of birth in ISO 8601 format (YYYY-MM-DD)
 *         address:
 *           type: string
 *           maxLength: 255
 *           description: Street address
 *         city:
 *           type: string
 *           maxLength: 100
 *           description: City name
 *         country:
 *           type: string
 *           maxLength: 100
 *           description: Country name
 *         national_id:
 *           type: string
 *           minLength: 14
 *           maxLength: 14
 *           pattern: '^[0-9]+$'
 *           description: 14-digit national ID (numbers only, must be unique)
 *         position:
 *           type: string
 *           maxLength: 100
 *           description: Job position/title
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Employment start date in ISO 8601 format (YYYY-MM-DD)
 *         salary:
 *           type: number
 *           format: decimal
 *           description: Monthly salary (optional, up to 2 decimal places)
 *         cv:
 *           type: string
 *           format: binary
 *           description: PDF file containing curriculum vitae (optional)
 *       example:
 *         username: "mark_staff"
 *         first_name: "Mark"
 *         last_name: "Magdy"
 *         email: "mark.magdy@anu.edu.eg"
 *         password: "SecureP@ss123"
 *         phone: "01234567890"
 *         date_of_birth: "1998-06-25"
 *         address: "123 Main St"
 *         city: "Cairo"
 *         country: "Egypt"
 *         national_id: "29806251234567"
 *         position: "HR Assistant"
 *         hireDate: "2023-05-01"
 *         salary: 12000.0
 *
 *     StaffAccount:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         staff:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             userId:
 *               type: integer
 *             position:
 *               type: string
 *             hireDate:
 *               type: string
 *               format: date-time
 *             salary:
 *               type: number
 *               nullable: true
 *             cvPath:
 *               type: string
 *               nullable: true
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
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
 *   parameters:
 *     TenantHeader:
 *       in: header
 *       name: host
 *       required: true
 *       schema:
 *         type: string
 *       description: Tenant subdomain for multi-tenant routing (e.g., www.anu.local or anu.uniact.edu.eg)
 *       example: www.anu.local
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtained from user login endpoint
 */

/**
 * @swagger
 * tags:
 *   - name: User Authentication
 *     description: User authentication endpoints for tenant-specific login
 *   - name: User Management
 *     description: User account creation and management endpoints
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticates a user within a specific tenant context and returns a JWT token.
 *       
 *       **Tenant Resolution:**
 *       The system automatically determines the tenant from the Host header:
 *       - Development: `www.anu.local` → tenant "anu"
 *       - Production: `anu.uniact.edu.eg` → tenant "anu"
 *       
 *       **Token Contents:**
 *       The returned JWT token includes:
 *       - User ID and email
 *       - University/tenant schema name
 *       - User roles (e.g., "admin", "staff", "student")
 *       - User permissions (e.g., "rbac.read", "account.create")
 *       
 *       **Important:** The Host header must match a registered tenant subdomain.
 *     tags: [User Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned with user roles and permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing or invalid Host header, tenant not found, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             examples:
 *               missingHost:
 *                 value:
 *                   status: "fail"
 *                   message: "Missing Host header. Cannot determine tenant."
 *               invalidHost:
 *                 value:
 *                   status: "fail"
 *                   message: "Access Denied"
 *               validationError:
 *                 value:
 *                   status: "fail"
 *                   data:
 *                     - msg: "Email is required."
 *                       param: "email"
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendFail'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Invalid email or password."
 *       404:
 *         description: Tenant not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: "fail"
 *               message: "Tenant not found or inactive for subdomain 'anu'."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post(
  "/login",
  ...UserValidator.Login(),
  ValidateRequest,
  TenantResolver,
  UserController.Login
);

/**
 * @swagger
 * /user/account/staff:
 *   post:
 *     summary: Create a staff account
 *     description: |
 *       Creates a new staff member account in the tenant's database schema with optional CV upload.
 *       
 *       **Request Format:** `multipart/form-data`
 *       
 *       This endpoint accepts two parts:
 *       1. **data** - JSON object containing all staff information
 *       2. **cv** - PDF file (optional)
 *       
 *       **Multipart Structure:**
 *       ```
 *       Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
 *       
 *       ------WebKitFormBoundary
 *       Content-Disposition: form-data; name="data"
 *       Content-Type: application/json
 *       
 *       {
 *         "username": "mark_staff",
 *         "first_name": "Mark",
 *         "last_name": "Magdy",
 *         ...
 *       }
 *       ------WebKitFormBoundary
 *       Content-Disposition: form-data; name="cv"; filename="resume.pdf"
 *       Content-Type: application/pdf
 *       
 *       [PDF binary data]
 *       ------WebKitFormBoundary--
 *       ```
 *       
 *       **Validations:**
 *       - Username, email, and national_id must be unique within the tenant
 *       - National ID must be exactly 14 digits (Egyptian format)
 *       - Password must meet security policy requirements
 *       - CV must be a PDF file if provided
 *       - Phone number validated as mobile phone (any international format)
 *       
 *       **Transaction:** User and Staff records are created atomically in a database transaction.
 *       
 *       **Note:** Email verification is planned but not yet implemented (TODO).
 *     tags: [User Management]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing staff account information
 *                 example: '{"username":"mark_staff","first_name":"Mark","last_name":"Magdy","email":"mark@example.com","password":"aaAA11!!","phone":"01234567890","date_of_birth":"1998-06-25","address":"123 Main St","city":"Cairo","country":"Egypt","national_id":"29806251234567","position":"HR Assistant","hireDate":"2023-05-01","salary":12000.0}'
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: PDF file containing the staff member's curriculum vitae (optional)
 *           encoding:
 *             data:
 *               contentType: application/json
 *             cv:
 *               contentType: application/pdf
 *     responses:
 *       201:
 *         description: Staff account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Staff account created successfully"
 *                     data:
 *                       $ref: '#/components/schemas/StaffAccount'
 *       400:
 *         description: Validation error, duplicate user, or invalid tenant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             examples:
 *               duplicateUser:
 *                 value:
 *                   status: "fail"
 *                   message: "User with the same email, username, or national ID already exists"
 *               validationError:
 *                 value:
 *                   status: "fail"
 *                   data:
 *                     - msg: "Username is required"
 *                       param: "username"
 *                     - msg: "National ID must be 14 digits"
 *                       param: "national_id"
 *               invalidCV:
 *                 value:
 *                   status: "fail"
 *                   data:
 *                     - msg: "CV must be a PDF file"
 *                       param: "cv"
 *               missingHost:
 *                 value:
 *                   status: "fail"
 *                   message: "Missing Host header. Cannot determine tenant."
 *       404:
 *         description: Tenant not found or inactive
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
  "/account/staff",
  TenantResolver,
  upload.single("cv"),
  ParseMultipartData,
  ...UserValidator.CreateStaffAccount(),
  ValidateRequest,
  UserController.CreateStaffAccount
);

//! TODO: Delete, Update, Read account for Student Account And Staff Account
//* Create Staff Account: Done

/**
 * @swagger
 * /user/*:
 *   all:
 *     summary: Handle undefined routes
 *     description: Returns 404 for any undefined routes under /user
 *     tags: [User Management]
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