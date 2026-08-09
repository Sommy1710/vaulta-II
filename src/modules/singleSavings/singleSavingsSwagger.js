/**
 * @swagger
 * tags:
 *   name: Single Savings
 *   description: Endpoints for managing individual savings plans.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     CreateSingleSavingsRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           example: 1000
 *           description: Amount the user wants to save. Minimum amount is 100.
 *
 *     PaymentDetails:
 *       type: object
 *       properties:
 *         bankName:
 *           type: string
 *           example: Opay
 *         accountNumber:
 *           type: string
 *           example: "8063443193"
 *         accountName:
 *           type: string
 *           example: vaulta savings Ltd
 *         amountToPay:
 *           type: number
 *           example: 1000
 *
 *     SingleSavings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmc8v3hzk0000qj4bskk22w0z
 *         userId:
 *           type: string
 *           example: 9f47dbdf-9378-4d8a-8e72-7ebf5fd72822
 *         firstname:
 *           type: string
 *           example: John
 *         lastname:
 *           type: string
 *           example: Doe
 *         username:
 *           type: string
 *           example: johndoe
 *         planType:
 *           type: string
 *           example: SINGLE
 *         amountSaved:
 *           type: number
 *           example: 1000
 *         interestRate:
 *           type: number
 *           example: 10
 *         expectedInterest:
 *           type: number
 *           example: 100
 *         totalPayout:
 *           type: number
 *           example: 1100
 *         startDate:
 *           type: string
 *           format: date-time
 *         maturityDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - MATURED
 *             - WITHDRAWN
 *             - PENDING
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     YieldResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Plan matured successfully
 *         total:
 *           type: number
 *           example: 1100
 */


/**
 * @swagger
 * /api/singleSavings/create-single-savings:
 *   post:
 *     summary: Create a Single Savings Plan
 *     description: |
 *       Creates a new single savings plan for the authenticated user.
 *
 *       **Important:**
 *       - User must be authenticated.
 *       - Minimum savings amount is **100**.
 *       - Creating the savings plan does **NOT** activate it immediately.
 *       - The response includes the bank account details where payment should be made.
 *
 *     tags:
 *       - Single Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSingleSavingsRequest'
 *
 *     responses:
 *       201:
 *         description: Savings plan created successfully.
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
 *                   example: Single savings plan created successfully. Please make payment with any of the following payment methods to activate your savings plan.
 *                 data:
 *                   type: object
 *                   properties:
 *                     savingsPlan:
 *                       $ref: '#/components/schemas/SingleSavings'
 *                     paymentDetails:
 *                       $ref: '#/components/schemas/PaymentDetails'
 *
 *       400:
 *         description: Validation failed or amount below minimum.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Minimum savings amount is 100
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 */


/**
 * @swagger
 * /api/singleSavings/get-total-yield/{planId}:
 *   get:
 *     summary: Get Total Yield of a Savings Plan
 *     description: |
 *       Calculates the total payout of a savings plan.
 *
 *       Behaviour:
 *       - Confirms the plan belongs to the authenticated user.
 *       - If the maturity date has passed, the plan is automatically updated to **MATURED**.
 *       - If the plan has not matured, only the original saved amount is returned.
 *       - If matured, returns the total payout (principal + interest).
 *
 *     tags:
 *       - Single Savings
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
 *         description: ID of the savings plan.
 *
 *     responses:
 *       200:
 *         description: Yield calculated successfully.
 *         content:
 *           application/json:
 *             examples:
 *
 *               matured:
 *                 summary: Plan has matured
 *                 value:
 *                   success: true
 *                   data:
 *                     message: Plan matured successfully
 *                     total: 1100
 *
 *               notMatured:
 *                 summary: Plan not matured
 *                 value:
 *                   success: true
 *                   data:
 *                     message: Plan has not matured yet
 *                     total: 1000
 *
 *       404:
 *         description: Plan not found or user does not own the plan.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Plan not found or you are not authorized to access it
 */


/**
 * @swagger
 * /api/singleSavings/get-single-savings-history:
 *   get:
 *     summary: Get My Savings History
 *     description: |
 *       Retrieves every single savings plan belonging to the authenticated user.
 *
 *       Results are sorted from the newest plan to the oldest.
 *
 *     tags:
 *       - Single Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Savings history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SingleSavings'
 *
 *       401:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 */
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     WithdrawSingleSavingsRequest:
 *       type: object
 *       required:
 *         - amount
 *         - WalletType
 *         - walletAddress
 *       properties:
 *         amount:
 *           type: number
 *           example: 500
 *           description: Amount the user wants to withdraw.
 *
 *         WalletType:
 *           type: string
 *           enum:
 *             - BITCOIN
 *             - ETHEREUM
 *           example: BITCOIN
 *           description: Cryptocurrency wallet type.
 *
 *         walletAddress:
 *           type: string
 *           example: bc1q9xv3z5w4c2a7m6k8r9t5u1v0p3q7l8m9n0xyz
 *           description: Destination wallet address.
 *
 *     SingleSavingsWithdrawal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmc89xy8g0000yx9c7g71abc
 *         userId:
 *           type: string
 *           example: 5f92495d-2c7d-4d88-8c1c-44efbe8bcb8d
 *         savingsPlanId:
 *           type: string
 *           example: cmc8v3hzk0000qj4bskk22w0z
 *         amount:
 *           type: number
 *           example: 500
 *         WalletType:
 *           type: string
 *           example: BITCOIN
 *         walletAddress:
 *           type: string
 *           example: bc1q9xv3z5w4c2a7m6k8r9t5u1v0p3q7l8m9n0xyz
 *         status:
 *           type: string
 *           example: SUCCESSFUL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /api/singleSavings/withdraw-single-savings/{planId}:
 *   patch:
 *     summary: Withdraw From Single Savings
 *     description: |
 *       Withdraw funds from a single savings plan.
 *
 *       **Behaviour**
 *       - User must own the savings plan.
 *       - Wallet type must be either **BITCOIN** or **ETHEREUM**.
 *       - Wallet address is required.
 *       - If the plan is **ACTIVE**, withdrawal is deducted from the saved amount and the expected interest is recalculated.
 *       - If the plan is **MATURED**, withdrawal is deducted from the total payout.
 *       - Every withdrawal is automatically stored in the withdrawal history.
 *
 *     tags:
 *       - Single Savings
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
 *         description: ID of the savings plan.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawSingleSavingsRequest'
 *
 *     responses:
 *       200:
 *         description: Withdrawal completed successfully.
 *         content:
 *           application/json:
 *             examples:
 *
 *               ActivePlan:
 *                 summary: Withdrawal from an active savings plan
 *                 value:
 *                   success: true
 *                   message: Withdrawal successful, awaiting approval
 *                   withdrawn: 500
 *                   walletType: BITCOIN
 *                   walletAddress: bc1q9xv3z5w4c2a7m6k8r9t5u1v0p3q7l8m9n0xyz
 *                   remainingBalance: 1500
 *
 *               MaturedPlan:
 *                 summary: Withdrawal from a matured savings plan
 *                 value:
 *                   success: true
 *                   message: Withdrawal successful
 *                   withdrawn: 500
 *                   remainingBalance: 1600
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *
 *               InvalidAmount:
 *                 value:
 *                   success: false
 *                   message: Invalid withdrawal amount
 *
 *               InvalidWallet:
 *                 value:
 *                   success: false
 *                   message: Wallet type must be BITCOIN or ETHEREUM
 *
 *               WalletMissing:
 *                 value:
 *                   success: false
 *                   message: wallet address is required
 *
 *               AmountExceeded:
 *                 value:
 *                   success: false
 *                   message: Withdrawal amount cannot exceed amount saved
 *
 *               PayoutExceeded:
 *                 value:
 *                   success: false
 *                   message: Withdrawal amount cannot exceed available payout
 *
 *       404:
 *         description: Savings plan not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Savings plan not found
 */


/**
 * @swagger
 * /api/singleSavings/single-savings-withdrawal-history:
 *   get:
 *     summary: Get Single Savings Withdrawal History
 *     description: |
 *       Retrieves all withdrawal transactions made by the authenticated user.
 *
 *       Each withdrawal includes:
 *       - Withdrawal amount
 *       - Wallet information
 *       - Withdrawal status
 *       - Related savings plan details
 *
 *       Results are ordered from the most recent withdrawal to the oldest.
 *
 *     tags:
 *       - Single Savings
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Withdrawal history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/SingleSavingsWithdrawal'
 *                       - type: object
 *                         properties:
 *                           savingsPlan:
 *                             type: object
 *                             properties:
 *                               amountSaved:
 *                                 type: number
 *                                 example: 2000
 *                               totalPayout:
 *                                 type: number
 *                                 example: 2200
 *                               status:
 *                                 type: string
 *                                 example: MATURED
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 */