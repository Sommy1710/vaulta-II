/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     description: |
 *       Creates a new administrator account.
 *
 *       **Note**
 *       - This endpoint creates a new admin.
 *       - Username and email must be unique.
 *       - Password is automatically hashed before being stored.
 *
 *     tags:
 *       - Admin
 *
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
 *                 example: superadmin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@vaulta.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *
 *     responses:
 *       201:
 *         description: Admin created successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Admin created successfully
 *
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: The request failed with the following errors
 *
 *       409:
 *         description: Username or email already exists.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: An admin with the provided details already exists
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Authenticate an admin
 *     description: |
 *       Authenticates an administrator using their email and password.
 *
 *       If the credentials are valid, a JWT authentication token is generated
 *       and returned as an HTTP-only cookie named **authentication**.
 *
 *       **Rate Limiting**
 *       - This endpoint is protected by an admin login rate limiter.
 *       - Too many failed attempts may temporarily block further login requests.
 *
 *     tags:
 *       - Admin
 *
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
 *                 example: admin@vaulta.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *
 *     responses:
 *       200:
 *         description: Login successful.
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: admin successfully logged in
 *
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: the request failed with the following errors
 *
 *       401:
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: We could not validate your credentials, please try again
 *
 *       404:
 *         description: Admin account not found.
 *         content:
 *           application/json:
 *             example:
 *               message: admin not found
 *
 *       429:
 *         description: Too many login attempts.
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/list-all-users:
 *   get:
 *     summary: Retrieve all users
 *     description: |
 *       Retrieves all registered users.
 *
 *       This endpoint is accessible **only to authenticated administrators**.
 *
 *       Supports:
 *       - Pagination
 *       - Sorting
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number.
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of users per page.
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *           enum:
 *             - firstname
 *             - lastname
 *             - username
 *             - email
 *             - createdAt
 *             - updatedAt
 *         required: false
 *         description: Field used to sort users.
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: asc
 *           enum:
 *             - asc
 *             - desc
 *         required: false
 *         description: Sort direction.
 *
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Users retrieved successfully
 *               data:
 *                 - id: "a1b2c3d4"
 *                   firstname: John
 *                   lastname: Doe
 *                   username: johndoe
 *                   email: john@example.com
 *                   role: USER
 *                   isEmailVerified: true
 *                   createdAt: "2026-06-20T12:00:00.000Z"
 *               pagination:
 *                 total: 50
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 5
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: User is not authorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to fetch all users
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/delete-user-by-admin/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: |
 *       Permanently deletes a user account from the system.
 *
 *       **Note**
 *       - Only authenticated administrators can perform this action.
 *       - If the user does not exist, a **404 Not Found** response is returned.
 *       - This action is irreversible.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Unique ID of the user to delete.
 *         schema:
 *           type: string
 *           example: 0c9a5e98-8c9b-4eb1-94a0-64dc3e4e7b7f
 *
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User deleted successfully
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to delete users
 *
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/list-all-savings-by-admin:
 *   get:
 *     summary: Retrieve all savings records
 *     description: |
 *       Retrieves all savings plans in the system.
 *
 *       This endpoint returns:
 *       - Single Savings
 *       - Duo Savings
 *       - Family Savings
 *
 *       Each savings category is paginated independently and includes its
 *       associated users, participants, invitations, withdrawal requests,
 *       and withdrawals where applicable.
 *
 *       Only authenticated administrators can access this endpoint.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page.
 *
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: createdAt
 *           enum:
 *             - createdAt
 *             - updatedAt
 *             - amountSaved
 *             - maturityDate
 *             - status
 *         description: Field used for sorting.
 *
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           default: asc
 *           enum:
 *             - asc
 *             - desc
 *         description: Sort order.
 *
 *     responses:
 *       200:
 *         description: Savings retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Savings retrieved successfully
 *               data:
 *                 singleSavings:
 *                   - id: clxxxxxxx
 *                     amountSaved: 100000
 *                     interestRate: 10
 *                     status: ACTIVE
 *                     user:
 *                       id: user123
 *                       firstname: John
 *                       lastname: Doe
 *                     withdrawals: []
 *
 *                 duoSavings:
 *                   - id: clyyyyyyy
 *                     amountSaved: 300000
 *                     interestRate: 15
 *                     status: ACTIVE
 *                     createdBy:
 *                       firstname: Jane
 *                       lastname: Doe
 *                     participants: []
 *                     invites: []
 *                     withdrawalRequests: []
 *
 *                 familySavings:
 *                   - id: clzzzzzzz
 *                     amountSaved: 900000
 *                     interestRate: 30
 *                     status: ACTIVE
 *                     createdBy:
 *                       firstname: David
 *                       lastname: James
 *                     participants: []
 *                     invites: []
 *                     withdrawalRequests: []
 *
 *               pagination:
 *                 singleSavings:
 *                   total: 24
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 3
 *                 duoSavings:
 *                   total: 12
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 2
 *                 familySavings:
 *                   total: 7
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to fetch all savings
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/delete-savings-by-admin/{type}/{id}:
 *   delete:
 *     summary: Delete a savings record
 *     description: |
 *       Permanently deletes a savings record from the system.
 *
 *       This endpoint supports deleting:
 *
 *       - Single Savings
 *       - Duo Savings
 *       - Family Savings
 *
 *       The savings type must be supplied as a path parameter.
 *
 *       **Allowed values**
 *       - single
 *       - duo
 *       - family
 *
 *       **Note**
 *       - Only authenticated administrators can perform this action.
 *       - This operation cannot be undone.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         description: Type of savings plan to delete.
 *         schema:
 *           type: string
 *           enum:
 *             - single
 *             - duo
 *             - family
 *           example: single
 *
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the savings record.
 *         schema:
 *           type: string
 *           example: clz7tpk1b0000v4c0v3r3z9xm
 *
 *     responses:
 *       200:
 *         description: Savings record deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: single savings record deleted successfully
 *
 *       400:
 *         description: Invalid savings type supplied.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid savings type. Use single, duo or family.
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to delete savings records
 *
 *       404:
 *         description: Savings record not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Savings record not found
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/get-all-reports-by-admin:
 *   get:
 *     summary: Retrieve all user reports
 *     description: |
 *       Retrieves every report submitted by users.
 *
 *       Each report includes the reporting user's basic information,
 *       report category, subject, description, current status,
 *       and any administrator response.
 *
 *       Reports are returned in descending order of creation date
 *       (newest reports first).
 *
 *       **Only authenticated administrators can access this endpoint.**
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Reports retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: clrpt123456
 *                   category: ACCOUNT
 *                   subject: Unable to login
 *                   description: I cannot access my account after resetting my password.
 *                   status: OPEN
 *                   adminResponse: null
 *                   createdAt: "2026-06-27T09:15:21.000Z"
 *                   updatedAt: "2026-06-27T09:15:21.000Z"
 *                   user:
 *                     id: usr123456
 *                     firstname: John
 *                     lastname: Doe
 *                     username: johndoe
 *                     email: john@example.com
 *
 *                 - id: clrpt789012
 *                   category: WITHDRAWAL
 *                   subject: Withdrawal delayed
 *                   description: My withdrawal has been pending for three days.
 *                   status: IN_PROGRESS
 *                   adminResponse: We are currently investigating the issue.
 *                   createdAt: "2026-06-25T14:20:18.000Z"
 *                   updatedAt: "2026-06-26T08:00:00.000Z"
 *                   user:
 *                     id: usr789012
 *                     firstname: Jane
 *                     lastname: Smith
 *                     username: janesmith
 *                     email: jane@example.com
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to perform this action
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/respond-to-report/{id}:
 *   patch:
 *     summary: Respond to a user report
 *     description: |
 *       Allows an authenticated administrator to respond to a report submitted
 *       by a user and optionally update the report's status.
 *
 *       This endpoint is typically used by support administrators after
 *       reviewing a user's complaint or issue.
 *
 *       Available report statuses include:
 *       - OPEN
 *       - IN_PROGRESS
 *       - RESOLVED
 *       - CLOSED
 *
 *       Only administrators are authorized to perform this action.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the report.
 *         schema:
 *           type: string
 *           example: clxw98dfj0000abc123xyz456
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminResponse
 *               - status
 *             properties:
 *               adminResponse:
 *                 type: string
 *                 example: We have investigated your complaint and resolved the issue.
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - OPEN
 *                   - IN_PROGRESS
 *                   - RESOLVED
 *                   - CLOSED
 *                 example: RESOLVED
 *
 *     responses:
 *       200:
 *         description: Report updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Response sent successfully.
 *               data:
 *                 id: clxw98dfj0000abc123xyz456
 *                 category: ACCOUNT
 *                 subject: Unable to verify email
 *                 description: My verification link has expired.
 *                 adminResponse: We have investigated your complaint and resolved the issue.
 *                 status: RESOLVED
 *                 createdAt: "2026-06-27T09:30:00.000Z"
 *                 updatedAt: "2026-06-27T11:15:42.000Z"
 *
 *       400:
 *         description: Invalid request body.
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to perform this action
 *
 *       404:
 *         description: Report not found.
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/delete-report-by-admin/{id}:
 *   delete:
 *     summary: Delete a user report
 *     description: |
 *       Permanently deletes a report submitted by a user.
 *
 *       This endpoint should only be used when a report is no longer
 *       needed, such as duplicate reports, spam reports, or reports
 *       that have already been resolved and archived elsewhere.
 *
 *       **Note**
 *       - Only authenticated administrators can delete reports.
 *       - This action is irreversible.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the report.
 *         schema:
 *           type: string
 *           example: clxw98dfj0000abc123xyz456
 *
 *     responses:
 *       200:
 *         description: Report deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Report deleted successfully.
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to perform this action
 *
 *       404:
 *         description: Report not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Report not found
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/get-all-conversations:
 *   get:
 *     summary: Retrieve all user support conversations
 *     description: |
 *       Retrieves every support conversation between users and administrators.
 *
 *       Each conversation includes:
 *       - The user's basic profile information.
 *       - Every message exchanged in the conversation.
 *       - Messages are returned in chronological order (oldest first).
 *       - The current conversation status.
 *
 *       This endpoint is intended for the admin dashboard where
 *       administrators can monitor and respond to user support requests.
 *
 *       **Notes**
 *       - Only authenticated administrators can access this endpoint.
 *       - Messages only indicate whether they were sent by a USER or an ADMIN.
 *       - The identity of the responding administrator is intentionally not stored.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: clxyz123456
 *                   status: OPEN
 *                   createdAt: "2026-06-27T08:00:00.000Z"
 *                   updatedAt: "2026-06-27T10:15:00.000Z"
 *                   user:
 *                     id: usr12345
 *                     firstname: John
 *                     lastname: Doe
 *                     email: john@example.com
 *                   messages:
 *                     - id: msg001
 *                       senderType: USER
 *                       message: Hello, I need help with my withdrawal.
 *                       isRead: true
 *                       createdAt: "2026-06-27T08:10:00.000Z"
 *
 *                     - id: msg002
 *                       senderType: ADMIN
 *                       message: Hello John, we're looking into it.
 *                       isRead: true
 *                       createdAt: "2026-06-27T08:12:30.000Z"
 *
 *                     - id: msg003
 *                       senderType: USER
 *                       message: Thank you.
 *                       isRead: false
 *                       createdAt: "2026-06-27T08:15:42.000Z"
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to perform this action
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/admin-reply/{conversationId}:
 *   post:
 *     summary: Reply to a support conversation
 *     description: |
 *       Allows an authenticated administrator to send a reply to a user's
 *       support conversation.
 *
 *       If the conversation exists, the message is saved and immediately
 *       broadcast to everyone connected to that conversation through
 *       Socket.IO.
 *
 *       **Socket Event**
 *       - Event Name: **newMessage**
 *       - Room: **conversation:{conversationId}**
 *
 *       **Note**
 *       - The system stores only that the sender is an **ADMIN**.
 *       - The specific administrator who sent the reply is intentionally
 *         not stored.
 *       - Only authenticated administrators can access this endpoint.
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         description: Unique identifier of the conversation.
 *         schema:
 *           type: string
 *           example: clxzy98ab0000m5abf4d2c9xy
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 5000
 *                 example: Hello, we've reviewed your complaint and your withdrawal has now been processed.
 *
 *     responses:
 *       201:
 *         description: Reply sent successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Reply sent successfully
 *               data:
 *                 id: msg123456
 *                 conversationId: clxzy98ab0000m5abf4d2c9xy
 *                 senderType: ADMIN
 *                 message: Hello, we've reviewed your complaint and your withdrawal has now been processed.
 *                 isRead: false
 *                 createdAt: "2026-06-27T14:10:35.000Z"
 *
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation failed
 *
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Authentication required
 *
 *       403:
 *         description: Administrator privileges required.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to perform this action
 *
 *       404:
 *         description: Conversation not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Conversation not found
 *
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/admin/get-user-savings-by-admin/{userId}:
 *   get:
 *     summary: Get all savings belonging to a specific user
 *     description: |
 *       Retrieves every savings plan owned by a specific user.
 *
 *       This endpoint returns:
 *       - User information
 *       - Single Savings plans
 *       - Duo Savings plans (created by the user or joined by the user)
 *       - Family Savings plans (created by the user or joined by the user)
 *       - A summary showing the total number of plans.
 *
 *       **Authentication Required:** Admin JWT Token
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user whose savings should be retrieved.
 *         schema:
 *           type: string
 *           example: "clz8q9e2k0000s81x5u3q1abc"
 *
 *     responses:
 *       200:
 *         description: User savings retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User savings retrieved successfully
 *               data:
 *                 user:
 *                   id: "clz8q9e2k0000s81x5u3q1abc"
 *                   firstname: "John"
 *                   lastname: "Doe"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                 singleSavings:
 *                   - id: "single123"
 *                     amountSaved: 50000
 *                     interestRate: 10
 *                     status: ACTIVE
 *                 duoSavings:
 *                   - id: "duo123"
 *                     amountSaved: 100000
 *                     status: ACTIVE
 *                 familySavings:
 *                   - id: "family123"
 *                     amountSaved: 300000
 *                     status: ACTIVE
 *                 summary:
 *                   totalSinglePlans: 1
 *                   totalDuoPlans: 1
 *                   totalFamilyPlans: 1
 *                   totalPlans: 3
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin privileges required.
 *
 *       404:
 *         description: User not found.
 */