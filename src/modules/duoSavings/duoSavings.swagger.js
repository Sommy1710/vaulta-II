/**
 * @swagger
 * /api/duoSavings/create-duo-savings:
 *   post:
 *     tags:
 *       - Duo Savings
 *     summary: Create a new Duo Savings plan
 *     description: |
 *       Creates a new Duo Savings plan for the authenticated user.
 *
 *       ### How it works
 *       - The authenticated user automatically becomes the creator of the savings plan.
 *       - The creator is also added as the first participant.
 *       - Minimum savings amount is **₦200**.
 *       - Duo Savings earns **15% interest**.
 *       - The savings plan matures after **21 days**.
 *       - After successful creation, payment instructions are returned.
 *
 *       ### Interest Calculation
 *       ```
 *       Expected Interest = Amount × 15%
 *       Total Payout = Amount + Expected Interest
 *       ```
 *
 *       ### Authentication
 *       Requires a valid Bearer Token.
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *                 description: Initial amount to save (minimum ₦200).
 *
 *     responses:
 *       201:
 *         description: Duo Savings plan created successfully.
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
 *                   example: Duo savings plan created successfully. Please make payment with any of the following payment methods to activate your savings plan.
 *
 *                 data:
 *                   type: object
 *
 *                   properties:
 *                     duoSavings:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: cmduo123456789
 *
 *                         createdById:
 *                           type: string
 *                           example: 5d2bfc49-f7c3-4f18-9d92-07e4f799fdab
 *
 *                         amountSaved:
 *                           type: number
 *                           example: 1000
 *
 *                         interestRate:
 *                           type: number
 *                           example: 15
 *
 *                         expectedInterest:
 *                           type: number
 *                           example: 150
 *
 *                         totalPayout:
 *                           type: number
 *                           example: 1150
 *
 *                         status:
 *                           type: string
 *                           example: ACTIVE
 *
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *
 *                         maturityDate:
 *                           type: string
 *                           format: date-time
 *
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *
 *                               contribution:
 *                                 type: number
 *                                 example: 1000
 *
 *                               joinedAt:
 *                                 type: string
 *                                 format: date-time
 *
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   firstname:
 *                                     type: string
 *                                     example: John
 *                                   lastname:
 *                                     type: string
 *                                     example: Doe
 *                                   username:
 *                                     type: string
 *                                     example: johndoe
 *                                   email:
 *                                     type: string
 *                                     example: john@example.com
 *
 *                     paymentDetails:
 *                       type: object
 *                       properties:
 *
 *                         bankTransfer:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: UNAVAILABLE
 *
 *                             message:
 *                               type: string
 *                               example: Bank payment currently unavailable, please try a different payment method.
 *
 *                         bitcoin:
 *                           type: object
 *                           properties:
 *                             network:
 *                               type: string
 *                               example: Bitcoin
 *
 *                             address:
 *                               type: string
 *                               example: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *
 *                             amountToPay:
 *                               type: number
 *                               example: 1000
 *
 *                         ethereum:
 *                           type: object
 *                           properties:
 *                             network:
 *                               type: string
 *                               example: Ethereum
 *
 *                             address:
 *                               type: string
 *                               example: 0xFCa95a8187e9BEd54df102C111CedaF93f596F2D
 *
 *                             amountToPay:
 *                               type: number
 *                               example: 1000
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *               InvalidAmount:
 *                 value:
 *                   success: false
 *                   message: Amount must be a valid number
 *
 *               MinimumAmount:
 *                 value:
 *                   success: false
 *                   message: Minimum savings amount is 200
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
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
 * /api/duoSavings/invite-user/{duoSavingsId}:
 *   post:
 *     tags:
 *       - Duo Savings
 *     summary: Invite a user to join a Duo Savings plan
 *     description: |
 *       Allows the creator of a Duo Savings plan to invite another registered user
 *       to become the second participant.
 *
 *       ### Rules
 *       - Authentication is required.
 *       - Only the creator of the Duo Savings plan can send invitations.
 *       - A user cannot invite themselves.
 *       - The invited user must exist.
 *       - A Duo Savings plan can only have **2 participants**.
 *       - A participant cannot be invited twice.
 *       - Duplicate invitations are not allowed.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: duoSavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Duo Savings plan.
 *         example: cmc0ab12xyz345678
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invitedUserId
 *             properties:
 *               invitedUserId:
 *                 type: string
 *                 description: The ID of the user to invite.
 *                 example: 73bceca4-21dd-47b0-9dc8-83930fcdbb61
 *
 *     responses:
 *       201:
 *         description: Invitation sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invitation sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cmc9inv123456789
 *                     duoSavingsId:
 *                       type: string
 *                       example: cmc0ab12xyz345678
 *                     invitedUserId:
 *                       type: string
 *                       example: 73bceca4-21dd-47b0-9dc8-83930fcdbb61
 *                     status:
 *                       type: string
 *                       example: PENDING
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             examples:
 *               InviteYourself:
 *                 summary: Cannot invite yourself
 *                 value:
 *                   success: false
 *                   message: You cannot invite yourself
 *
 *               DuoFull:
 *                 summary: Savings plan already has two participants
 *                 value:
 *                   success: false
 *                   message: This duo savings plan already has two participants
 *
 *               AlreadyParticipant:
 *                 summary: User is already a participant
 *                 value:
 *                   success: false
 *                   message: User is already a participant
 *
 *               InviteExists:
 *                 summary: Invitation already exists
 *                 value:
 *                   success: false
 *                   message: Invite already exists
 *
 *       401:
 *         description: Unauthorized. User is not authenticated.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *
 *       403:
 *         description: Forbidden. Only the creator can invite another participant.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only the creator can invite a partner
 *
 *       404:
 *         description: Resource not found.
 *         content:
 *           application/json:
 *             examples:
 *               SavingsNotFound:
 *                 value:
 *                   success: false
 *                   message: Duo savings plan not found
 *
 *               UserNotFound:
 *                 value:
 *                   success: false
 *                   message: Invited user not found
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to send invitation
 */
/**
 * @swagger
 * /api/duoSavings/invites:
 *   get:
 *     tags:
 *       - Duo Savings
 *     summary: Get all pending Duo Savings invitations
 *     description: |
 *       Retrieves all **pending Duo Savings invitations** for the authenticated user.
 *
 *       ### How it works
 *       - Authentication is required.
 *       - Only invitations with a **PENDING** status are returned.
 *       - Each invitation includes:
 *         - The invitation details.
 *         - Information about the Duo Savings plan.
 *         - Information about the creator of the savings plan.
 *       - Invitations are ordered from the newest to the oldest.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Pending invitations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 count:
 *                   type: integer
 *                   example: 2
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: cmab123456789xyz
 *
 *                       duoSavingsId:
 *                         type: string
 *                         example: cmduo123456789xyz
 *
 *                       invitedUserId:
 *                         type: string
 *                         example: 6e2d9d75-8fd6-4f6d-b43e-3d3e86fd3412
 *
 *                       status:
 *                         type: string
 *                         example: PENDING
 *
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 *                       duoSavings:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: cmduo123456789xyz
 *
 *                           amountSaved:
 *                             type: number
 *                             example: 5000
 *
 *                           interestRate:
 *                             type: number
 *                             example: 15
 *
 *                           maturityDate:
 *                             type: string
 *                             format: date-time
 *
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 6f74d2ef-0f42-48a2-99b2-33c0cb7f25b2
 *
 *                               firstname:
 *                                 type: string
 *                                 example: John
 *
 *                               lastname:
 *                                 type: string
 *                                 example: Doe
 *
 *                               username:
 *                                 type: string
 *                                 example: johndoe
 *
 *                               email:
 *                                 type: string
 *                                 format: email
 *                                 example: john@example.com
 *
 *       401:
 *         description: Unauthorized. Authentication token is missing or invalid.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *
 *       500:
 *         description: Failed to fetch invitations.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to fetch invites
 */
/**
 * @swagger
 * /api/duoSavings/accept-invite/{inviteId}:
 *   patch:
 *     summary: Accept a Duo Savings Invitation
 *     description: |
 *       Allows the invited user to accept a pending Duo Savings invitation.
 *
 *       Once accepted:
 *       - The user becomes a participant in the savings plan.
 *       - The invitation status changes to **ACCEPTED**.
 *       - Every other pending invitation for the same Duo Savings plan is automatically rejected.
 *
 *       Only the invited user can perform this action.
 *
 *     tags:
 *       - Duo Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invitation to accept.
 *
 *     responses:
 *       200:
 *         description: Invitation accepted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Invite accepted successfully
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *               AlreadyAccepted:
 *                 summary: Invite already accepted
 *                 value:
 *                   success: false
 *                   message: Invite has already been accepted
 *
 *               AlreadyRejected:
 *                 summary: Invite already rejected
 *                 value:
 *                   success: false
 *                   message: Invite has already been rejected
 *
 *               SavingsFull:
 *                 summary: Savings already has two participants
 *                 value:
 *                   success: false
 *                   message: This duo savings plan already has two participants
 *
 *               AlreadyParticipant:
 *                 summary: User already joined
 *                 value:
 *                   success: false
 *                   message: You are already a participant in this savings plan
 *
 *       401:
 *         description: User is not authenticated.
 *
 *       403:
 *         description: User is not authorized to accept this invitation.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to accept this invite
 *
 *       404:
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invite not found
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to accept invite
 */
/**
 * @swagger
 * /api/duoSavings/deposit/{duoSavingsId}:
 *   post:
 *     summary: Deposit Money into a Duo Savings Plan
 *     description: |
 *       Allows an existing participant to make an additional deposit into an active Duo Savings plan.
 *
 *       Every successful deposit:
 *       - Updates the participant's contribution.
 *       - Increases the total amount saved.
 *       - Recalculates the expected interest.
 *       - Updates the total payout.
 *
 *       The response also includes the available cryptocurrency payment addresses
 *       where the user should complete the payment.
 *
 *     tags:
 *       - Duo Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: duoSavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duo Savings plan.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *                 description: Amount to deposit into the savings plan.
 *
 *     responses:
 *       200:
 *         description: Deposit request created successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Deposit successful, please make your deposit with any of the following payment methods
 *               data:
 *                 updatedSavings:
 *                   id: clxyz123456
 *                   amountSaved: 1500
 *                   interestRate: 15
 *                   expectedInterest: 225
 *                   totalPayout: 1725
 *                   status: ACTIVE
 *                 paymentDetails:
 *                   bankTransfer:
 *                     status: UNAVAILABLE
 *                     message: Bank payment currently unavailable, please try a different payment method.
 *                   bitcoin:
 *                     network: Bitcoin
 *                     address: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *                     amountToPay: 500
 *                   ethereum:
 *                     network: Ethereum
 *                     address: 0xFCa95a8187e9BEd54df102C111CedaF93f596F2D
 *                     amountToPay: 500
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *               InvalidAmount:
 *                 summary: Invalid deposit amount
 *                 value:
 *                   success: false
 *                   message: Please provide a valid amount
 *
 *               PlanInactive:
 *                 summary: Savings plan inactive
 *                 value:
 *                   success: false
 *                   message: This savings plan is no longer active
 *
 *               PlanMatured:
 *                 summary: Savings has matured
 *                 value:
 *                   success: false
 *                   message: Savings plan has matured. Deposits are no longer allowed.
 *
 *       401:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *
 *       403:
 *         description: User is not a participant of this Duo Savings plan.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only participants can deposit into this savings plan
 *
 *       404:
 *         description: Duo Savings plan not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Duo savings plan not found
 *
 *       500:
 *         description: Internal server error.
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/get-duo-savings-yield/{planId}:
 *   get:
 *     tags:
 *       - Duo Savings
 *     summary: Get duo savings total yield
 *     description: |
 *       Returns the current financial summary of a Duo Savings plan.
 *
 *       This endpoint calculates and returns:
 *       - Current amount saved
 *       - Total accumulated interest
 *       - Total payout
 *       - Current savings status
 *
 *       If the savings plan has reached its maturity date and is still ACTIVE,
 *       the system automatically:
 *       - Calculates the final interest
 *       - Updates the savings status to MATURED
 *       - Updates the total payout
 *
 *       **Only participants of the Duo Savings plan can access this endpoint.**
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duo Savings plan.
 *
 *     responses:
 *       200:
 *         description: Duo savings yield retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 amountSaved: 15000
 *                 expectedInterest: 2250
 *                 totalPayout: 17250
 *                 status: MATURED
 *
 *       403:
 *         description: User is not a participant in this Duo Savings plan.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not a participant in this duo savings plan
 *
 *       404:
 *         description: Duo Savings plan not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Duo savings plan not found
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/get-duo-savings-history/{duoSavingsId}:
 *   get:
 *     tags:
 *       - Duo Savings
 *     summary: Get Duo Savings history
 *     description: |
 *       Retrieves the complete details of a Duo Savings plan.
 *
 *       The response includes:
 *       - Savings information
 *       - Total amount saved
 *       - Interest rate
 *       - Expected interest
 *       - Total payout
 *       - Maturity date
 *       - Current status
 *       - Date created
 *       - All participants and their profile information
 *
 *       **Only participants of the Duo Savings plan can access this endpoint.**
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: duoSavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duo Savings plan.
 *
 *     responses:
 *       200:
 *         description: Duo Savings history retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: clx123abc456
 *                 amountSaved: 20000
 *                 interestRate: 15
 *                 expectedInterest: 3000
 *                 totalPayout: 23000
 *                 status: ACTIVE
 *                 startDate: "2026-06-28T08:00:00.000Z"
 *                 maturityDate: "2026-07-19T08:00:00.000Z"
 *                 participants:
 *                   - id: participant1
 *                     contribution: 12000
 *                     joinedAt: "2026-06-28T08:00:00.000Z"
 *                     user:
 *                       id: user1
 *                       firstname: John
 *                       lastname: Doe
 *                       username: johndoe
 *                       email: john@example.com
 *                   - id: participant2
 *                     contribution: 8000
 *                     joinedAt: "2026-06-29T10:15:00.000Z"
 *                     user:
 *                       id: user2
 *                       firstname: Jane
 *                       lastname: Smith
 *                       username: janesmith
 *                       email: jane@example.com
 *
 *       404:
 *         description: Duo Savings plan not found or user is not a participant.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Duo savings plan not found
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/withdraw-from-duo-savings/{duoSavingsId}:
 *   post:
 *     tags:
 *       - Duo Savings
 *     summary: Request withdrawal from a Duo Savings plan
 *     description: |
 *       Allows a participant of a Duo Savings plan to request a withdrawal.
 *
 *       The withdrawal request is **not executed immediately**.
 *
 *       Once submitted:
 *       - A withdrawal request is created.
 *       - The participant who initiated the request is automatically marked as approved.
 *       - The second participant must approve the request before it can be executed.
 *       - Withdrawals can be requested from both ACTIVE and MATURED savings plans,
 *         provided the requested amount does not exceed the available balance.
 *
 *       Supported wallet types:
 *       - BITCOIN
 *       - ETHEREUM
 *
 *       **Only participants of the Duo Savings plan can request withdrawals.**
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: duoSavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duo Savings plan.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - WalletType
 *               - walletAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               WalletType:
 *                 type: string
 *                 enum:
 *                   - BITCOIN
 *                   - ETHEREUM
 *                 example: BITCOIN
 *               walletAddress:
 *                 type: string
 *                 example: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *
 *     responses:
 *       201:
 *         description: Withdrawal request submitted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Withdrawal request submitted. Waiting for second approval.
 *               data:
 *                 id: clx123withdrawal
 *                 duoSavingsId: clx123plan
 *                 requestedById: user123
 *                 amount: 5000
 *                 WalletType: BITCOIN
 *                 walletAddress: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *                 creatorApproved: true
 *                 partnerApproved: false
 *                 status: PENDING
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *               InvalidWalletType:
 *                 value:
 *                   success: false
 *                   message: Wallet type must be BITCOIN or ETHEREUM
 *               WalletAddressRequired:
 *                 value:
 *                   success: false
 *                   message: wallet address is required
 *               InvalidAmount:
 *                 value:
 *                   success: false
 *                   message: Invalid withdrawal amount
 *               InsufficientBalance:
 *                 value:
 *                   success: false
 *                   message: Withdrawal amount exceeds available balance
 *
 *       403:
 *         description: User is not a participant of this Duo Savings plan.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only participants can request withdrawals
 *
 *       404:
 *         description: Duo Savings plan not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Savings plan not found
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/get-pending-duo-savings-withdrawal-approvals:
 *   get:
 *     tags:
 *       - Duo Savings
 *     summary: Get pending Duo Savings withdrawal approvals
 *     description: |
 *       Retrieves all pending withdrawal requests that require the authenticated
 *       user's approval.
 *
 *       The endpoint automatically:
 *       - Returns only withdrawal requests with a PENDING status.
 *       - Excludes requests created by the authenticated user.
 *       - Returns only requests where the authenticated user is a participant.
 *       - Determines whether the authenticated user is still required to approve
 *         each withdrawal request.
 *
 *       The response includes:
 *       - Withdrawal request details
 *       - Requester's information
 *       - Savings plan details
 *       - All participants of the savings plan
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Pending withdrawal approvals retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 1
 *               data:
 *                 - id: clxwithdraw123
 *                   amount: 7000
 *                   WalletType: ETHEREUM
 *                   walletAddress: 0xFCa95a8187e9BEd54df102C111CedaF93f596F2D
 *                   creatorApproved: true
 *                   partnerApproved: false
 *                   status: PENDING
 *                   requestedBy:
 *                     id: user123
 *                     firstname: John
 *                     lastname: Doe
 *                     username: johndoe
 *                     email: john@example.com
 *                   duoSavings:
 *                     id: clxplan123
 *                     amountSaved: 20000
 *                     expectedInterest: 3000
 *                     totalPayout: 23000
 *                     status: ACTIVE
 *                     participants:
 *                       - contribution: 12000
 *                         user:
 *                           firstname: John
 *                           lastname: Doe
 *                       - contribution: 8000
 *                         user:
 *                           firstname: Jane
 *                           lastname: Smith
 *
 *       401:
 *         description: Unauthorized. Authentication token is missing or invalid.
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/approve-duo-savings-withdrawal/{requestId}:
 *   patch:
 *     tags:
 *       - Duo Savings
 *     summary: Approve a Duo Savings withdrawal request
 *     description: |
 *       Allows a participant in a Duo Savings plan to approve a pending withdrawal request.
 *
 *       Withdrawal requests require approval from **both participants** before they are executed.
 *
 *       Approval process:
 *       - If only one participant has approved, the request remains **PENDING**.
 *       - Once both participants approve, the withdrawal is automatically executed.
 *       - If the savings plan has matured, the withdrawal amount is deducted from the total payout.
 *       - If the savings plan is still active, the withdrawal amount is deducted from the current savings balance
 *         and the expected interest and total payout are recalculated.
 *       - If the remaining matured balance becomes zero, the savings plan status changes to **WITHDRAWN**.
 *
 *       Only participants of the savings plan are allowed to approve withdrawal requests.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID.
 *
 *     responses:
 *       200:
 *         description: Approval processed successfully.
 *         content:
 *           application/json:
 *             examples:
 *               WaitingForSecondApproval:
 *                 value:
 *                   success: true
 *                   message: Approval recorded. Waiting for second participant.
 *
 *               WithdrawalExecuted:
 *                 value:
 *                   success: true
 *                   message: Withdrawal approved and executed
 *
 *       400:
 *         description: Withdrawal request has already been processed.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: This request has already been processed
 *
 *       403:
 *         description: User is not authorized to approve this withdrawal.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only participants can approve withdrawals
 *
 *       404:
 *         description: Withdrawal request not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Withdrawal request not found
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/reject-duo-savings-withdrawal/{requestId}:
 *   patch:
 *     tags:
 *       - Duo Savings
 *     summary: Reject a Duo Savings withdrawal request
 *     description: |
 *       Allows a participant of a Duo Savings plan to reject a pending withdrawal request.
 *
 *       Once rejected:
 *       - The withdrawal request status becomes **REJECTED**.
 *       - The withdrawal will not be executed.
 *       - No funds are deducted from the savings plan.
 *
 *       Only participants of the savings plan are allowed to reject withdrawal requests.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID.
 *
 *     responses:
 *       200:
 *         description: Withdrawal request rejected successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Withdrawal request rejected
 *
 *       403:
 *         description: User is not a participant of the savings plan.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only participants can reject requests
 *
 *       404:
 *         description: Withdrawal request not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Withdrawal request not found
 */
/**************************************************************************************
 * @swagger
 * /api/duoSavings/duo-savings-withdrawaal-history/{duoSavingsId}:
 *   get:
 *     tags:
 *       - Duo Savings
 *     summary: Get Duo Savings withdrawal history
 *     description: |
 *       Retrieves the complete withdrawal history for a Duo Savings plan.
 *
 *       The response includes:
 *       - Every withdrawal request submitted
 *       - Withdrawal amount
 *       - Wallet information
 *       - Current withdrawal status
 *       - Requester's information
 *       - Current savings plan information
 *
 *       Withdrawal statuses include:
 *       - PENDING
 *       - APPROVED
 *       - REJECTED
 *       - EXECUTED
 *
 *       Only participants of the Duo Savings plan can access its withdrawal history.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: duoSavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: Duo Savings plan ID.
 *
 *     responses:
 *       200:
 *         description: Withdrawal history retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: withdrawal123
 *                   amount: 5000
 *                   WalletType: BITCOIN
 *                   walletAddress: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *                   status: EXECUTED
 *                   creatorApproved: true
 *                   partnerApproved: true
 *                   requestedBy:
 *                     id: user123
 *                     firstname: John
 *                     lastname: Doe
 *                     username: johndoe
 *                     email: john@example.com
 *                   duoSavings:
 *                     id: savings123
 *                     amountSaved: 15000
 *                     expectedInterest: 2250
 *                     totalPayout: 17250
 *                     status: ACTIVE
 *
 *       403:
 *         description: User is not a participant of the savings plan.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only participants can view withdrawal history
 *
 *       401:
 *         description: Unauthorized. Authentication token is missing or invalid.
 */