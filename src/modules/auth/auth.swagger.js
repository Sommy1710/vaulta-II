/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User Authentication & Account Management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         firstname:
 *           type: string
 *           example: John
 *         lastname:
 *           type: string
 *           example: Doe
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *         password:
 *           type: string
 *           example: Password123
 *
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *         password:
 *           type: string
 *           example: Password123
 *
 *     VerifyEmail:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *         otp:
 *           type: string
 *           example: "483921"
 *
 *     UpdateUser:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           example: John
 *         lastname:
 *           type: string
 *           example: Smith
 *         username:
 *           type: string
 *           example: johnsmith
 *
 *     ForgotPassword:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *
 *     ResetPassword:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *         otp:
 *           type: string
 *           example: "834821"
 *         newPassword:
 *           type: string
 *           example: NewPassword123
 *
 *     ReportProblem:
 *       type: object
 *       required:
 *         - subject
 *         - message
 *       properties:
 *         subject:
 *           type: string
 *           example: Unable to withdraw
 *         message:
 *           type: string
 *           example: My withdrawal has been pending for over 24 hours.
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Creates a new user account and sends an email verification OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User account created successfully.
 *       400:
 *         description: Validation error.
 *       409:
 *         description: Email or username already exists.
 */

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify Email OTP
 *     tags: [Authentication]
 *     description: Verifies a user's email address using the OTP sent during registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmail'
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags: [Authentication]
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout User
 *     tags: [Authentication]
 *     description: Logs out the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 */

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get Authenticated User
 *     tags: [Authentication]
 *     description: Returns the currently authenticated user's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   put:
 *     summary: Update User Profile
 *     tags: [Authentication]
 *     description: Update firstname, lastname or username.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: e2dd13e2-0d45-4f5d-b85d-74abcb2bd45d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/delete/{userId}:
 *   delete:
 *     summary: Delete User Account
 *     tags: [Authentication]
 *     description: Permanently deletes a user account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: e2dd13e2-0d45-4f5d-b85d-74abcb2bd45d
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentication]
 *     description: Sends a password reset OTP to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentication]
 *     description: Resets the user's password after OTP verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid or expired OTP.
 */

/**
 * @swagger
 * /api/auth/report-Problem:
 *   post:
 *     summary: Report a Problem
 *     tags: [Authentication]
 *     description: Allows an authenticated user to submit a complaint or issue.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportProblem'
 *     responses:
 *       201:
 *         description: Report submitted successfully.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/auth/get-My-Reports:
 *   get:
 *     summary: Get My Reports
 *     tags: [Authentication]
 *     description: Retrieves all reports submitted by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */