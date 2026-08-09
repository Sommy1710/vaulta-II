/**
 * ============================================================
 * MESSAGE ENDPOINTS
 * ============================================================
 */

/**
 * @swagger
 * /api/messages/send-message:
 *   post:
 *     summary: Send a message to support
 *     description: |
 *       Allows an authenticated user to send a message to the support/admin team.
 *
 *       ### How it works
 *       - If the user already has an OPEN conversation, the message is added to that conversation.
 *       - If the user does not have an OPEN conversation, a new conversation is automatically created.
 *       - The message sender is automatically recorded as USER.
 *       - After the message is saved, Socket.IO broadcasts the new message in real-time to everyone currently connected to that conversation room.
 *
 *     tags:
 *       - Messages
 *
 *     security:
 *       - bearerAuth: []
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
 *                 minLength: 1
 *                 maxLength: 5000
 *                 example: Hello, I need help with my savings withdrawal.
 *
 *     responses:
 *       201:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cmdu5jk9f00008f7z4qaz7s6e
 *
 *                     conversationId:
 *                       type: string
 *                       example: cmdu5jhf3000017v2o1m9mq2j
 *
 *                     senderType:
 *                       type: string
 *                       enum:
 *                         - USER
 *                         - ADMIN
 *                       example: USER
 *
 *                     message:
 *                       type: string
 *                       example: Hello, I need help with my savings withdrawal.
 *
 *                     isRead:
 *                       type: boolean
 *                       example: false
 *
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Validation failed.
 *
 *       401:
 *         description: User not authenticated.
 *
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/messages/get-messages:
 *   get:
 *     summary: Retrieve all messages in the authenticated user's conversation
 *     description: |
 *       Returns the authenticated user's conversation together with every message
 *       exchanged between the user and the admin team.
 *
 *       Messages are ordered from the oldest message to the newest message.
 *
 *       If the user has never contacted support, the returned data will be null.
 *
 *     tags:
 *       - Messages
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cmdu5jhf3000017v2o1m9mq2j
 *
 *                     userId:
 *                       type: string
 *                       example: 986f2d34-1ef4-4704-98fa-fbde62bb7e2d
 *
 *                     status:
 *                       type: string
 *                       enum:
 *                         - OPEN
 *                         - CLOSED
 *                       example: OPEN
 *
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *
 *                           conversationId:
 *                             type: string
 *
 *                           senderType:
 *                             type: string
 *                             enum:
 *                               - USER
 *                               - ADMIN
 *
 *                           message:
 *                             type: string
 *                             example: Your withdrawal request has been approved.
 *
 *                           isRead:
 *                             type: boolean
 *                             example: true
 *
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *
 *       401:
 *         description: User not authenticated.
 *
 *       500:
 *         description: Internal server error.
 */