/**
 * @swagger
 * tags:
 *   name: Family Savings
 *   description: Family savings management endpoints
 */

/**
 * @swagger
 * /api/familySavings/create-family-savings:
 *   post:
 *     summary: Create a family savings plan
 *     description: |
 *       Creates a new Family Savings plan for the authenticated user.
 *
 *       **Rules**
 *       - User must be authenticated.
 *       - Minimum savings amount is **₦1000**.
 *       - Creator automatically becomes the first participant.
 *       - Interest rate is fixed at **30%**.
 *       - Maturity period is **21 days**.
 *       - Payment instructions for Bitcoin and Ethereum are returned.
 *
 *     tags:
 *       - Family Savings
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
 *                 example: 5000
 *                 description: Amount to save (minimum ₦1000)
 *
 *     responses:
 *       201:
 *         description: Family savings plan created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Family savings plan created successfully. Please make payment using any of the available payment methods below to activate your savings plan.
 *               data:
 *                 familySavings:
 *                   id: clxxxxx
 *                   amountSaved: 5000
 *                   interestRate: 30
 *                   expectedInterest: 1500
 *                   totalPayout: 6500
 *                   status: ACTIVE
 *                 paymentDetails:
 *                   bankTransfer:
 *                     status: UNAVAILABLE
 *                     message: Bank payment currently unavailable, please try a different payment method.
 *                   bitcoin:
 *                     network: Bitcoin
 *                     address: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *                     amountToPay: 5000
 *                   ethereum:
 *                     network: Ethereum
 *                     address: 0xFCa95a8187e9BEd54df102C111CedaF93f596F2D
 *                     amountToPay: 5000
 *
 *       400:
 *         description: Invalid amount
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
 *                   message: Minimum savings amount is 1000
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 */

/**
 * @swagger
 * /api/familySavings/invite-user/{familySavingsId}:
 *   post:
 *     summary: Invite a user to join a family savings plan
 *     description: |
 *       Sends an invitation to another registered user to join a Family Savings plan.
 *
 *       **Rules**
 *       - Only the creator of the savings plan can send invitations.
 *       - You cannot invite yourself.
 *       - The invited user must exist.
 *       - Duplicate invitations are not allowed.
 *       - A plan cannot have more than two participants.
 *
 *     tags:
 *       - Family Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: familySavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family savings plan ID
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
 *                 example: e65b6d74-a0e4-4e9e-b8cd-123456789abc
 *                 description: ID of the user being invited
 *
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Invitation sent successfully
 *               data:
 *                 id: clinvite123
 *                 familySavingsId: clsavings123
 *                 invitedUserId: user123
 *                 status: PENDING
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             examples:
 *               InviteSelf:
 *                 value:
 *                   success: false
 *                   message: You cannot invite yourself
 *
 *               AlreadyParticipant:
 *                 value:
 *                   success: false
 *                   message: User is already a participant
 *
 *               AlreadyInvited:
 *                 value:
 *                   success: false
 *                   message: Invite already exists
 *
 *               PlanFull:
 *                 value:
 *                   success: false
 *                   message: This family savings plan already has two participants
 *
 *       403:
 *         description: User is not the creator
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only the creator can invite a partner
 *
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             examples:
 *               SavingsNotFound:
 *                 value:
 *                   success: false
 *                   message: Family savings plan not found
 *
 *               UserNotFound:
 *                 value:
 *                   success: false
 *                   message: Invited user not found
 *
 *       500:
 *         description: Failed to send invitation
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to send invitation
 */

/**
 * @swagger
 * /api/familySavings/invites:
 *   get:
 *     summary: Get my pending family savings invitations
 *     description: |
 *       Returns all pending Family Savings invitations for the authenticated user,
 *       including details of the savings plan and the creator.
 *
 *     tags:
 *       - Family Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Pending invitations retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 1
 *               data:
 *                 - id: clinvite123
 *                   status: PENDING
 *                   createdAt: "2026-06-28T10:00:00.000Z"
 *                   familySavings:
 *                     id: clsavings123
 *                     amountSaved: 10000
 *                     interestRate: 30
 *                     maturityDate: "2026-07-19T10:00:00.000Z"
 *                     createdBy:
 *                       id: creator123
 *                       firstname: John
 *                       lastname: Doe
 *                       username: johndoe
 *                       email: john@example.com
 *
 *       500:
 *         description: Failed to fetch invitations
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to fetch invites
 */
/**
 * @swagger
 * /api/familySavings/accept-invite/{inviteId}:
 *   patch:
 *     summary: Accept a family savings invitation
 *     description: |
 *       Allows the authenticated user to accept a pending Family Savings invitation.
 *
 *       **Rules**
 *       - User must be the invited user.
 *       - Invitation must exist.
 *       - Invitation must still be pending.
 *       - Family savings plan cannot exceed five participants.
 *       - User cannot already be a participant.
 *       - Once accepted:
 *         - The invitation status becomes **ACCEPTED**.
 *         - The user is added as a participant.
 *         - All other pending invitations for the same savings plan are automatically rejected.
 *
 *     tags:
 *       - Family Savings
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
 *         description: Family savings invitation ID
 *
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Invite accepted successfully
 *
 *       400:
 *         description: Invalid invitation
 *         content:
 *           application/json:
 *             examples:
 *               AlreadyHandled:
 *                 value:
 *                   success: false
 *                   message: Invite has already been accepted
 *
 *               FamilyFull:
 *                 value:
 *                   success: false
 *                   message: This family savings plan already has five participants
 *
 *               AlreadyParticipant:
 *                 value:
 *                   success: false
 *                   message: You are already a participant in this savings plan
 *
 *       403:
 *         description: Unauthorized to accept invite
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not authorized to accept this invite
 *
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invite not found
 *
 *       500:
 *         description: Failed to accept invite
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to accept invite
 */


/**
 * @swagger
 * /api/familySavings/deposit/{familySavingsId}:
 *   post:
 *     summary: Deposit into a family savings plan
 *     description: |
 *       Allows an authenticated participant to make an additional deposit into a Family Savings plan.
 *
 *       **Rules**
 *       - User must be authenticated.
 *       - User must already be a participant.
 *       - Savings plan must exist.
 *       - Savings plan must still be ACTIVE.
 *       - Deposits are not allowed after maturity.
 *       - Deposit amount must be greater than zero.
 *       - The plan's expected interest and total payout are recalculated after every successful deposit.
 *       - Bitcoin and Ethereum payment instructions are returned.
 *
 *     tags:
 *       - Family Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: familySavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family savings plan ID
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
 *                 example: 5000
 *                 description: Amount to deposit
 *
 *     responses:
 *       200:
 *         description: Deposit processed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Deposit successful, please make your deposit with any of the following payment methods
 *               data:
 *                 updatedSavings:
 *                   id: clfamily123
 *                   amountSaved: 20000
 *                   expectedInterest: 6000
 *                   totalPayout: 26000
 *                   status: ACTIVE
 *                 paymentDetails:
 *                   bankTransfer:
 *                     status: UNAVAILABLE
 *                     message: Bank payment currently unavailable, please try a different payment method.
 *                   bitcoin:
 *                     network: Bitcoin
 *                     address: bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp
 *                     amountToPay: 5000
 *                   ethereum:
 *                     network: Ethereum
 *                     address: 0xFCa95a8187e9BEd54df102C111CedaF93f596F2D
 *                     amountToPay: 5000
 *
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               InvalidAmount:
 *                 value:
 *                   success: false
 *                   message: Please provide a valid amount
 *
 *               PlanInactive:
 *                 value:
 *                   success: false
 *                   message: This savings plan is no longer active
 *
 *               Matured:
 *                 value:
 *                   success: false
 *                   message: Savings plan has matured. Deposits are no longer allowed.
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *
 *       403:
 *         description: User is not a participant
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Only participants can deposit into this savings plan
 *
 *       404:
 *         description: Family savings plan not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Family savings plan not found
 */


/**
 * @swagger
 * /api/familySavings/get-family-savings-yield/{planId}:
 *   get:
 *     summary: Get family savings total yield
 *     description: |
 *       Returns the current amount saved, accrued interest, total payout and status
 *       of a Family Savings plan.
 *
 *       If the plan has reached its maturity date, it is automatically updated to
 *       **MATURED**, and the final interest and payout are calculated before the
 *       response is returned.
 *
 *       **Only participants of the savings plan can access this endpoint.**
 *
 *     tags:
 *       - Family Savings
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
 *         description: Family savings plan ID
 *
 *     responses:
 *       200:
 *         description: Family savings yield retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 amountSaved: 20000
 *                 expectedInterest: 6000
 *                 totalPayout: 26000
 *                 status: MATURED
 *
 *       403:
 *         description: User is not a participant
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: You are not a participant in this family savings plan
 *
 *       404:
 *         description: Family savings plan not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Family savings plan not found
 */
/**
 * @swagger
 * /api/familySavings/get-family-savings-history/{familySavingsId}:
 *   get:
 *     summary: Get a family savings plan history
 *     description: |
 *       Retrieves the complete details of a family savings plan that the authenticated user
 *       participates in, including all participants and their information.
 *
 *       Only participants of the savings plan can access this endpoint.
 *     tags:
 *       - Family Savings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familySavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family savings plan ID.
 *     responses:
 *       200:
 *         description: Family savings history retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "clxyz123456"
 *                 amountSaved: 50000
 *                 interestRate: 30
 *                 expectedInterest: 15000
 *                 totalPayout: 65000
 *                 status: ACTIVE
 *                 participants:
 *                   - id: "participant1"
 *                     contribution: 25000
 *                     user:
 *                       id: "user1"
 *                       firstname: "John"
 *                       lastname: "Doe"
 *                       username: "johndoe"
 *                       email: "john@example.com"
 *       404:
 *         description: Savings plan not found.
 *       401:
 *         description: Unauthorized.
 */


/**
 * @swagger
 * /api/familySavings/withdraw-from-family-savings/{familySavingsId}:
 *   post:
 *     summary: Request withdrawal from a family savings plan
 *     description: |
 *       Creates a withdrawal request for a family savings plan.
 *
 *       The request must be approved by another participant before the withdrawal
 *       is executed.
 *
 *       Withdrawal can only be requested by participants of the plan.
 *     tags:
 *       - Family Savings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familySavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family savings plan ID.
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
 *                 example: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
 *     responses:
 *       201:
 *         description: Withdrawal request submitted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Withdrawal request submitted. Waiting for second approval.
 *       400:
 *         description: Invalid request or insufficient balance.
 *       403:
 *         description: User is not a participant.
 *       404:
 *         description: Savings plan not found.
 *       401:
 *         description: Unauthorized.
 */


/**
 * @swagger
 * /api/familySavings/get-pending-family-savings-withdrawal-approvals:
 *   get:
 *     summary: Get pending withdrawal approvals
 *     description: |
 *       Returns all pending family savings withdrawal requests that require
 *       approval from the authenticated participant.
 *
 *       Requests created by the authenticated user are excluded.
 *     tags:
 *       - Family Savings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending approvals retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 1
 *               data:
 *                 - id: "withdrawal123"
 *                   amount: 10000
 *                   creatorApproved: false
 *                   partnerApproved: true
 *                   status: PENDING
 *                   requestedBy:
 *                     firstname: Jane
 *                     lastname: Doe
 *                     username: janedoe
 *                   familySavings:
 *                     amountSaved: 50000
 *                     totalPayout: 65000
 *       401:
 *         description: Unauthorized.
 */


/**
 * @swagger
 * /api/familySavings/approve-family-savings-withdrawal/{requestId}:
 *   patch:
 *     summary: Approve a family savings withdrawal request
 *     description: |
 *       Approves a pending withdrawal request.
 *
 *       Once all required participants approve the request, the withdrawal
 *       is automatically executed and the savings balance is updated.
 *     tags:
 *       - Family Savings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID.
 *     responses:
 *       200:
 *         description: Approval processed successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Withdrawal approved and executed
 *       400:
 *         description: Request has already been processed.
 *       403:
 *         description: Only participants can approve withdrawals.
 *       404:
 *         description: Withdrawal request not found.
 *       401:
 *         description: Unauthorized.
 */


/**
 * @swagger
 * /api/familySavings/reject-family-savings-withdrawal/{requestId}:
 *   patch:
 *     summary: Reject a family savings withdrawal request
 *     description: |
 *       Rejects a pending withdrawal request.
 *
 *       Only participants of the family savings plan are allowed
 *       to reject withdrawal requests.
 *     tags:
 *       - Family Savings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID.
 *     responses:
 *       200:
 *         description: Withdrawal request rejected successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Withdrawal request rejected
 *       403:
 *         description: Only participants can reject requests.
 *       404:
 *         description: Withdrawal request not found.
 *       401:
 *         description: Unauthorized.
 */


/**
 * @swagger
 * /api/familySavings/family-savings-withdrawal-history/{familySavingsId}:
 *   get:
 *     summary: Get family savings withdrawal history
 *     description: |
 *       Retrieves all withdrawal requests associated with a family savings plan,
 *       including who requested each withdrawal and its current status.
 *
 *       Only participants of the family savings plan can access this endpoint.
 *     tags:
 *       - Family Savings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familySavingsId
 *         required: true
 *         schema:
 *           type: string
 *         description: Family savings plan ID.
 *     responses:
 *       200:
 *         description: Withdrawal history retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "withdrawal1"
 *                   amount: 10000
 *                   WalletType: BITCOIN
 *                   walletAddress: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
 *                   status: EXECUTED
 *                   requestedBy:
 *                     firstname: John
 *                     lastname: Doe
 *                     username: johndoe
 *                   familySavings:
 *                     amountSaved: 40000
 *                     totalPayout: 52000
 *                     expectedInterest: 12000
 *                     status: ACTIVE
 *       403:
 *         description: Only participants can view withdrawal history.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Savings plan not found.
 */