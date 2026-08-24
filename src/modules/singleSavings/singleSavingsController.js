import {prisma} from "../../config/db.prisma.js";
import { asyncHandler } from "../../lib/util.js";
import * as singleSavingsService from "./singleSavingsService.js";



export const createSingleSavingsPlan = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;



    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({
            success: false,
            message: "Amount is required",
        });
    }

    if (amount < 100) {
        return res.status(400).json({
            success: false,
            message: "Minimum savings amount is 100",
        });
    }

    const savingsPlan =
        await singleSavingsService.createSingleSavingsPlan(
            userId,
            Number(amount)
        );

    res.status(201).json({
        success: true,
        message: "Single savings plan created and pending admin approval. Please make payment with any of the following payment methods; your plan will be activated once an admin approves it.",
        data: {
            savingsPlan,
            paymentDetails: {
                bankTransfer: {
                    status: "UNAVAILABLE",
                    message:
                    "Bank payment currently unavailable, please try a different payment method."
                },
                bitcoin: {
            network: "Bitcoin",
            address:
            "bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp",
            amountToPay: amount,
          },

          ethereum: {
            network: "Ethereum",
            address:
            "0xFCa95a8187e9BEd54df102C111CedaF93f596F2D",
            amountToPay: amount,
          },
            }

        }
        
    });
});




export const getTotalYield = asyncHandler(async (req, res) => {
    const { planId } = req.params;

    const userId = req.user?.id || req.user?._id;

    let plan = await prisma.singleSavings.findFirst({
        where: {
            id: planId,
            userId,
        },
    });

    if (!plan) {
        return res.status(404).json({
            success: false,
            message:
                "Plan not found or you are not authorized to access it",
        });
    }

    const now = new Date();

    // If maturity date has passed, update status and payout
    if (
        plan.status === "ACTIVE" &&
        now >= plan.maturityDate
    ) {
        const expectedInterest =
            (plan.amountSaved * plan.interestRate) / 100;

        const totalPayout =
            plan.amountSaved + expectedInterest;

        plan = await prisma.singleSavings.update({
            where: {
                id: plan.id,
            },
            data: {
                status: "MATURED",
                expectedInterest,
                totalPayout,
                lastCompoundedAt: plan.maturityDate,
            },
        });
    }

    if (plan.status !== "MATURED") {
        return res.status(200).json({
            success: true,
            data: {
                message: "Plan has not matured yet",
                total: plan.amountSaved,
            },
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            message: "Plan matured successfully",
            total: plan.totalPayout,
        },
    });
});

export const getMySavingsHistory = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const savingsHistory = await prisma.singleSavings.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        success: true,
        count: savingsHistory.length,
        data: savingsHistory,
    });
});


export const withdrawSingleSavings = asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const { amount, WalletType, walletAddress } = req.body;

    const userId = req.user?.id || req.user?._id;

    const plan = await prisma.singleSavings.findFirst({
        where: {
            id: planId,
            userId,
        },
    });

    if (!plan) {
        return res.status(404).json({
            success: false,
            message: "Savings plan not found",
        });
    }

    if (plan.status !== "ACTIVE" && plan.status !== "MATURED") {
        return res.status(400).json({
            success: false,
            message: "Plan is not active",
        });
    }

    if (plan.status === "ACTIVE" && new Date() < plan.maturityDate) {
        return res.status(400).json({
            success: false,
            message:
                "Savings plan has not matured yet. Withdrawals are not allowed until maturity.",
        });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid withdrawal amount",
        });
    }
    if (
    !WalletType ||
    !["BITCOIN", "ETHEREUM"].includes(WalletType)
  ) {
    return res.status(400).json({
      success: false,
      message:
      "Wallet type must be BITCOIN or ETHEREUM",
    });
  }

  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      message: "wallet address is required",
    });
  }

    // caps at total payout once interest has been credited (MATURED), otherwise at principal saved
    const availableBalance = plan.status === "MATURED" ? plan.totalPayout : plan.amountSaved;
    if (amount > availableBalance) {
        return res.status(400).json({
            success: false,
            message:
                plan.status === "MATURED"
                    ? "Withdrawal amount cannot exceed available payout"
                    : "Withdrawal amount cannot exceed amount saved",
        });
    }

    // Save withdrawal request — balance is only adjusted once an admin approves it
    await prisma.singleSavingsWithdrawal.create({
        data: {
            userId,
            savingsPlanId: plan.id,
            amount,
            WalletType,
            walletAddress,
            status: "PENDING",
        },
    });

    return res.status(200).json({
        success: true,
        message: "Withdrawal request submitted and is pending admin approval.",
        requested: amount,
        walletType: WalletType,
        walletAddress: walletAddress,
    });
});

export const getSingleSavingsWithdrawalHistory = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;

    const withdrawals =
    await prisma.singleSavingsWithdrawal.findMany({
        where: {
            userId,
        },
        include: {
            savingsPlan: {
                select: {
                    amountSaved: true,
                    totalPayout: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        success: true,
        count: withdrawals.length,
        data: withdrawals,
    });
});