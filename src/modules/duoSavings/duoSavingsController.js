import {prisma} from "../../config/db.prisma.js";
import { asyncHandler } from './../../lib/util.js';


export const createDuoSavings = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const amount = Number(req.body.amount);

  if (isNaN(amount)) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a valid number",
    });
  }

  if (amount < 200) {
    return res.status(400).json({
      success: false,
      message: "Minimum savings amount is 200",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const interestRate = 15;

  const expectedInterest =
    (amount * interestRate) / 100;

  const totalPayout =
    amount + expectedInterest;

  const maturityDate = new Date();

  // TESTING ONLY
  /*maturityDate.setMinutes(
    maturityDate.getMinutes() + 2
  );*/

  //Production
  maturityDate.setDate(
    maturityDate.getDate() + 21
  );

  const duoSavings = await prisma.$transaction(
    async (tx) => {
      return await tx.duoSavings.create({
        data: {
          createdById: user.id,

          amountSaved: amount,

          interestRate,

          expectedInterest,

          totalPayout,

          maturityDate,
          status: "PENDING",

          participants: {
            create: {
              userId: user.id,
              contribution: amount,
            },
          },
        },

        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }
  );

  return res.status(201).json({
  success: true,
  message:
    "Duo savings plan created and pending admin approval. Please make payment with any of the following payment methods; your plan will be activated once an admin approves it.",
  data: {
    duoSavings,
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
    },
  },
})
});

export const inviteUserToDuoSavings = async (req, res) => {
  const { duoSavingsId } = req.params;
  const { invitedUserId } = req.body;

  const creatorId = req.user.id;

  try {
    // Check savings exists
    const duoSavings = await prisma.duoSavings.findUnique({
      where: {
        id: duoSavingsId,
      },
      include: {
        participants: true,
        invites: true,
      },
    });

    if (!duoSavings) {
      return res.status(404).json({
        success: false,
        message: "Duo savings plan not found",
      });
    }

    // Only creator can invite
    if (duoSavings.createdById !== creatorId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can invite a partner",
      });
    }

    // Cannot invite self
    if (creatorId === invitedUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself",
      });
    }

    // Check invited user exists
    const invitedUser = await prisma.user.findUnique({
      where: {
        id: invitedUserId,
      },
    });

    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: "Invited user not found",
      });
    }

    // Ensure savings is not already full
    if (duoSavings.participants.length >= 2) {
      return res.status(400).json({
        success: false,
        message: "This duo savings plan already has two participants",
      });
    }

    // Check if user is already a participant
    const existingParticipant =
      duoSavings.participants.find(
        (participant) => participant.userId === invitedUserId
      );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: "User is already a participant",
      });
    }

    // Check pending invite
    const existingInvite = await prisma.duoSavingsInvite.findUnique({
      where: {
        duoSavingsId_invitedUserId: {
          duoSavingsId,
          invitedUserId,
        },
      },
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "Invite already exists",
      });
    }

    // Create invite
    const invite = await prisma.duoSavingsInvite.create({
      data: {
        duoSavingsId,
        invitedUserId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: invite,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send invitation",
    });
  }
};


export const getMyDuoSavingsInvites = async (req, res) => {
  const userId = req.user.id;

  try {
    const invites = await prisma.duoSavingsInvite.findMany({
      where: {
        invitedUserId: userId,
        status: "PENDING",
      },
      include: {
        duoSavings: {
          select: {
            id: true,
            amountSaved: true,
            interestRate: true,
            maturityDate: true,
            createdBy: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: invites.length,
      data: invites,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invites",
    });
  }
};


export const acceptDuoSavingsInvite = async (req, res) => {
  const { inviteId } = req.params;

  const userId = req.user.id;

  try {
    const invite = await prisma.duoSavingsInvite.findUnique({
      where: {
        id: inviteId,
      },
      include: {
        duoSavings: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    // Only invited user can accept
    if (invite.invitedUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this invite",
      });
    }

    if (invite.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Invite has already been ${invite.status.toLowerCase()}`,
      });
    }

    // Ensure duo is not already full
    if (invite.duoSavings.participants.length >= 2) {
      return res.status(400).json({
        success: false,
        message: "This duo savings plan already has two participants",
      });
    }

    const existingParticipant =
      invite.duoSavings.participants.find(
        (participant) => participant.userId === userId
      );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: "You are already a participant in this savings plan",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Accept invite
      await tx.duoSavingsInvite.update({
        where: {
          id: inviteId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      // Add participant
      await tx.duoSavingsParticipant.create({
        data: {
          duoSavingsId: invite.duoSavingsId,
          userId,
        },
      });

      // Reject all other pending invites for this savings plan
      await tx.duoSavingsInvite.updateMany({
        where: {
          duoSavingsId: invite.duoSavingsId,
          status: "PENDING",
          NOT: {
            id: inviteId,
          },
        },
        data: {
          status: "REJECTED",
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Invite accepted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept invite",
    });
  }
};

export const depositToDuoSavings = asyncHandler(
  async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const { duoSavingsId } = req.params;
    const amount = Number(req.body.amount);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount",
      });
    }

    const duoSavings =
      await prisma.duoSavings.findUnique({
        where: {
          id: duoSavingsId,
        },
      });

    if (!duoSavings) {
      return res.status(404).json({
        success: false,
        message: "Duo savings plan not found",
      });
    }

    if (duoSavings.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This savings plan is no longer active",
      });
    }

    // Prevent deposits after maturity
    if (
      new Date() >=
      new Date(duoSavings.maturityDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Savings plan has matured. Deposits are no longer allowed.",
      });
    }

    const participant =
      await prisma.duoSavingsParticipant.findUnique({
        where: {
          duoSavingsId_userId: {
            duoSavingsId,
            userId,
          },
        },
      });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message:
          "Only participants can deposit into this savings plan",
      });
    }

    // Balance is only adjusted once an admin approves the deposit
    const deposit = await prisma.duoSavingsDeposit.create({
      data: {
        duoSavingsId,
        depositedById: userId,
        amount,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Deposit request submitted and is pending admin approval. Please make your deposit with any of the following payment methods",
      data: {
        deposit,
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
        },
      },
    });
  }
);


export const getDuoSavingsTotalYield = asyncHandler(
  async (req, res) => {
    const { planId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const participant =
      await prisma.duoSavingsParticipant.findFirst({
        where: {
          duoSavingsId: planId,
          userId,
        },
      });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this duo savings plan",
      });
    }

    let plan = await prisma.duoSavings.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Duo savings plan not found",
      });
    }

    const now = new Date();

    // Maturity reached
    if (
      plan.status === "ACTIVE" &&
      now >= plan.maturityDate
    ) {
      const interest =
        (plan.amountSaved * plan.interestRate) / 100;

      const expectedInterest =
        plan.expectedInterest + interest;

      const totalPayout =
        plan.amountSaved + expectedInterest;

      plan = await prisma.duoSavings.update({
        where: {
          id: plan.id,
        },
        data: {
          status: "MATURED",
          expectedInterest,
          totalPayout,
          lastCompoundedAt: now,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        amountSaved: plan.amountSaved,
        expectedInterest: plan.expectedInterest,
        totalPayout: plan.totalPayout,
        status: plan.status,
      },
    });
  }
);

export const getDuoSavingsHistory = asyncHandler(
  async (req, res) => {
    const { duoSavingsId } = req.params;

    const userId =
      req.user?.id || req.user?._id;

    const plan =
      await prisma.duoSavings.findFirst({
        where: {
          id: duoSavingsId,
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message:
          "Duo savings plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  }
);

export const requestDuoSavingsWithdrawal =
asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  const { duoSavingsId } = req.params;
  const { amount, WalletType, walletAddress } = req.body;

  const plan =
    await prisma.duoSavings.findUnique({
      where: {
        id: duoSavingsId,
      },
      include: {
        participants: true,
      },
    });

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Savings plan not found",
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

  const participant =
    plan.participants.find(
      (p) => p.userId === userId
    );

  if (!participant) {
    return res.status(403).json({
      success: false,
      message:
        "Only participants can request withdrawals",
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid withdrawal amount",
    });
  }

  const availableBalance =
    plan.status === "MATURED"
      ? plan.totalPayout
      : plan.amountSaved;

  if (amount > availableBalance) {
    return res.status(400).json({
      success: false,
      message:
        "Withdrawal amount exceeds available balance",
    });
  }

  const withdrawal =
    await prisma.duoSavingsWithdrawalRequest.create({
      data: {
        duoSavingsId,
        requestedById: userId,
        amount,

        WalletType,
        walletAddress,

        creatorApproved:
          userId === plan.createdById,

        partnerApproved:
          userId !== plan.createdById,
      },
    });

  return res.status(201).json({
    success: true,
    message:
      "Withdrawal request submitted. Waiting for second approval.",
    data: withdrawal,
  });
});

export const getPendingWithdrawalApprovals =
  asyncHandler(async (req, res) => {
    const userId =
      req.user?.id || req.user?._id;

    const requests =
      await prisma.duoSavingsWithdrawalRequest.findMany({
        where: {
          status: "PENDING",

          duoSavings: {
            participants: {
              some: {
                userId,
              },
            },
          },

          // Don't show requests created by yourself
          requestedById: {
            not: userId,
          },
        },

        include: {
          requestedBy: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              email: true,
            },
          },

          duoSavings: {
            select: {
              id: true,
              createdById: true,
              amountSaved: true,
              totalPayout: true,
              expectedInterest: true,
              status: true,

              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                      username: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const awaitingApproval =
      requests.filter((request) => {
        const isCreator =
          request.duoSavings.createdById === userId;

        // Creator still needs to approve
        if (
          isCreator &&
          !request.creatorApproved
        ) {
          return true;
        }

        // Partner still needs to approve
        if (
          !isCreator &&
          !request.partnerApproved
        ) {
          return true;
        }

        return false;
      });

    return res.status(200).json({
      success: true,
      count: awaitingApproval.length,
      data: awaitingApproval,
    });
  });

export const approveDuoSavingsWithdrawal =
asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  const { requestId } = req.params;

  const request =
    await prisma.duoSavingsWithdrawalRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        duoSavings: {
          include: {
            participants: true,
          },
        },
      },
    });

  if (!request) {
    return res.status(404).json({
      success: false,
      message:
        "Withdrawal request not found",
    });
  }

  if (request.status !== "PENDING") {
    return res.status(400).json({
      success: false,
      message:
        "This request has already been processed",
    });
  }

  const participant =
    request.duoSavings.participants.find(
      (p) => p.userId === userId
    );

  if (!participant) {
    return res.status(403).json({
      success: false,
      message:
        "Only participants can approve withdrawals",
    });
  }

  let creatorApproved =
    request.creatorApproved;

  let partnerApproved =
    request.partnerApproved;

  if (
    userId === request.duoSavings.createdById
  ) {
    creatorApproved = true;
  } else {
    partnerApproved = true;
  }

  let status = "PENDING";

  if (
    creatorApproved &&
    partnerApproved
  ) {
    status = "APPROVED";
  }

  const updatedRequest =
    await prisma.duoSavingsWithdrawalRequest.update({
      where: {
        id: requestId,
      },
      data: {
        creatorApproved,
        partnerApproved,
        status,
      },
    });

  if (status === "APPROVED") {
    const plan =
      request.duoSavings;

    if (plan.status === "MATURED") {
      const remaining =
        plan.totalPayout -
        request.amount;

      await prisma.duoSavings.update({
        where: {
          id: plan.id,
        },
        data: {
          totalPayout: remaining,

          ...(remaining <= 0 && {
            status: "WITHDRAWN",
          }),
        },
      });
    } else {
      const remaining =
        plan.amountSaved -
        request.amount;

      const interest =
        (remaining *
          plan.interestRate) /
        100;

      await prisma.duoSavings.update({
        where: {
          id: plan.id,
        },
        data: {
          amountSaved: remaining,
          expectedInterest: interest,
          totalPayout:
            remaining + interest,
        },
      });
    }

    await prisma.duoSavingsWithdrawalRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "EXECUTED",
      },
    });
  }

  return res.status(200).json({
    success: true,
    message:
      status === "APPROVED"
        ? "Withdrawal approved and executed"
        : "Approval recorded. Waiting for second participant.",
  });
});

export const rejectDuoSavingsWithdrawal =
asyncHandler(async (req, res) => {
  const userId =
    req.user?.id || req.user?._id;

  const { requestId } = req.params;

  const request =
    await prisma.duoSavingsWithdrawalRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        duoSavings: {
          include: {
            participants: true,
          },
        },
      },
    });

  if (!request) {
    return res.status(404).json({
      success: false,
      message:
        "Withdrawal request not found",
    });
  }

  const participant =
    request.duoSavings.participants.find(
      (p) => p.userId === userId
    );

  if (!participant) {
    return res.status(403).json({
      success: false,
      message:
        "Only participants can reject requests",
    });
  }

  await prisma.duoSavingsWithdrawalRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: "REJECTED",
    },
  });

  return res.status(200).json({
    success: true,
    message:
      "Withdrawal request rejected",
  });
});

export const getDuoSavingsWithdrawalHistory =
  asyncHandler(async (req, res) => {
    const { duoSavingsId } = req.params;

    const userId =
      req.user?.id || req.user?._id;

    // Verify user is a participant
    const participant =
      await prisma.duoSavingsParticipant.findFirst({
        where: {
          duoSavingsId,
          userId,
        },
      });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message:
          "Only participants can view withdrawal history",
      });
    }

    const withdrawals =
      await prisma.duoSavingsWithdrawalRequest.findMany({
        where: {
          duoSavingsId,
        },

        include: {
          requestedBy: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              email: true,
            },
          },

          duoSavings: {
            select: {
              id: true,
              amountSaved: true,
              totalPayout: true,
              expectedInterest: true,
              status: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals,
    });
  });

export const getDuoSavingsDepositHistory =
  asyncHandler(async (req, res) => {
    const { duoSavingsId } = req.params;

    const userId =
      req.user?.id || req.user?._id;

    // Verify user is a participant
    const participant =
      await prisma.duoSavingsParticipant.findFirst({
        where: {
          duoSavingsId,
          userId,
        },
      });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message:
          "Only participants can view deposit history",
      });
    }

    const deposits =
      await prisma.duoSavingsDeposit.findMany({
        where: {
          duoSavingsId,
        },

        include: {
          depositedBy: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              email: true,
            },
          },

          duoSavings: {
            select: {
              id: true,
              amountSaved: true,
              totalPayout: true,
              expectedInterest: true,
              status: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: deposits.length,
      data: deposits,
    });
  });

export const getMyDuoPlans = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const [asCreator, asParticipant] = await Promise.all([
    prisma.duoSavings.findMany({
      where: { createdById: userId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstname: true, lastname: true, username: true, email: true },
            },
          },
        },
        invites: { where: { status: 'PENDING' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.duoSavingsParticipant.findMany({
      where: { userId },
      include: {
        duoSavings: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, firstname: true, lastname: true, username: true, email: true },
                },
              },
            },
            invites: { where: { status: 'PENDING' } },
          },
        },
      },
    }),
  ]);

  const participantPlans = asParticipant.map((p) => p.duoSavings);
  const planMap = new Map();
  [...asCreator, ...participantPlans].forEach((p) => planMap.set(p.id, p));
  const plans = Array.from(planMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});