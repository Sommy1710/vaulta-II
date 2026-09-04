import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import { CreateAdminRequest, UpdateAdminRequest } from './create-admin.request.js';
import { AuthAdminRequest } from './auth-admin.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
import { prisma } from '../../config/db.prisma.js';
import * as adminService from './admin.service.js';
import { UnauthenticatedError, UnauthorizedError } from '../../lib/error-definitions.js';
import {io} from "../../bootstrap/server.js";
import { SendMessageRequest } from '../messages/send.message.request.js';

export const createAdminAccount = asyncHandler(async(req, res) => {
    const requester = req.admin;

    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const validator = new Validator();

    const {value, errors} = validator.validate(CreateAdminRequest, req.body);
    if (errors)
        throw new ValidationError('The request failed with the following errors', errors)

    const adminData = {
        value
    }

    await authService.registerAdmin(value);
    return res.status(201).json({
        success: true,
        message: "Admin created successfully"
    })
});

export const authenticateAdmin = asyncHandler(async(req, res) => {
    const validator = new Validator();
    const {value, errors} = validator.validate(AuthAdminRequest, req.body);
    if (errors) throw new ValidationError('the request failed with the following errors', errors);

    const admin = await adminService.getAdminByEmail(value.email);
    if (!admin) {
        return res.status(404).json({message: 'admin not found'});
    }

    const token = await authService.authenticateAdmin(value, req);
    return res.status(200).json({success: true, message: "admin successfully logged in", data: {token}});

});

export const listAllUsersByAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = parseInt(req.query.limit) || 10; // default 10 users
  const sortBy = req.query.sortBy || "createdAt"; // default sort field
  const sortOrder = req.query.order === "desc" ? "desc" : "asc"; // Prisma uses 'asc'/'desc'

  const requester = req.admin;

  // Allow only admins
  const isAdmin = ["ADMIN"].includes(requester.role);
  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all users");
  }

  const skip = (page - 1) * limit;

  // Fetch users with pagination and sorting
  const users = await prisma.user.findMany({
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  const totalUsers = await prisma.user.count();

  return res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
    pagination: {
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    },
  });
});

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only allow admins
  const isAdmin = ["ADMIN"].includes(requester.role);
  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to delete users");
  }

  const { userId } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Delete user
  await prisma.user.delete({
    where: { id: userId },
  });

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const listAllSavingsByAdmin = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only allow admins
  const isAdmin = ["ADMIN"].includes(requester.role);
  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all savings");
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order === "desc" ? "desc" : "asc";

  // Fetch single savings
  const singleSavings = await prisma.singleSavings.findMany({
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
    include: {
      user: true, // include user info
      withdrawals: true, // include withdrawals
    },
  });

  const totalSingleSavings = await prisma.singleSavings.count();

  // Fetch duo savings
  const duoSavings = await prisma.duoSavings.findMany({
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
    include: {
      createdBy: true,
      participants: { include: { user: true } },
      invites: { include: { invitedUser: true } },
      withdrawalRequests: { include: { requestedBy: true } },
      deposits: { include: { depositedBy: true } },
    },
  });

  const totalDuoSavings = await prisma.duoSavings.count();
  //fetch family savings
  const familySavings = await prisma.familySavings.findMany({
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
    include: {
      createdBy: true,
      participants: {include: {user: true}},
      invites: {include: {invitedUser: true}},
      withdrawalRequests: {include: {requestedBy: true}},
      deposits: { include: { depositedBy: true } },
    },
  });

  const totalFamilySavings = await prisma.familySavings.count();

  return res.status(200).json({
    success: true,
    message: "Savings retrieved successfully",
    data: {
      singleSavings,
      duoSavings,
      familySavings,
    },
    pagination: {
      singleSavings: {
        total: totalSingleSavings,
        page,
        limit,
        totalPages: Math.ceil(totalSingleSavings / limit),
      },
      duoSavings: {
        total: totalDuoSavings,
        page,
        limit,
        totalPages: Math.ceil(totalDuoSavings / limit),
      },
      familySavings: {
        total: totalFamilySavings,
        page,
        limit,
        totalPages: Math.ceil(totalFamilySavings / limit),
      },
    },
  });
});

export const deleteSavingsByAdmin = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only admins can delete savings
  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to delete savings records"
    );
  }

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Savings ID is required",
    });
  }

  let savings = null;
  let SavingsModel = null;
  let savingsType = null;

  // =========================
  // CHECK SINGLE SAVINGS
  // =========================

  savings = await prisma.singleSavings.findUnique({
    where: {
      id,
    },
  });

  if (savings) {
    SavingsModel = prisma.singleSavings;
    savingsType = "Single";
  }

  // =========================
  // CHECK DUO SAVINGS
  // =========================

  if (!savings) {
    savings = await prisma.duoSavings.findUnique({
      where: {
        id,
      },
    });

    if (savings) {
      SavingsModel = prisma.duoSavings;
      savingsType = "Duo";
    }
  }

  // =========================
  // CHECK FAMILY SAVINGS
  // =========================

  if (!savings) {
    savings = await prisma.familySavings.findUnique({
      where: {
        id,
      },
    });

    if (savings) {
      SavingsModel = prisma.familySavings;
      savingsType = "Family";
    }
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!savings) {
    return res.status(404).json({
      success: false,
      message: "Savings record not found",
    });
  }

  // =========================
  // DELETE
  // =========================

  await SavingsModel.delete({
    where: {
      id,
    },
  });

  return res.status(200).json({
    success: true,
    message: `${savingsType} savings record deleted successfully`,
    data: {
      id,
      savingsType,
    },
  });
});

function getSavingsPlanModel(type) {
  switch (type.toLowerCase()) {
    case "single":
      return prisma.singleSavings;
    case "duo":
      return prisma.duoSavings;
    case "family":
      return prisma.familySavings;
    default:
      return null;
  }
}

export const approveSavingsPlan = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const { planId } = req.params;

    if (!planId) {
        return res.status(400).json({
            success: false,
            message: "Savings plan ID is required",
        });
    }

    let SavingsModel = null;
    let plan = null;
    let savingsType = null;

    // =========================
    // CHECK SINGLE SAVINGS
    // =========================
    plan = await prisma.singleSavings.findUnique({
        where: {
            id: planId,
        },
    });

    if (plan) {
        SavingsModel = prisma.singleSavings;
        savingsType = "Single";
    }

    // =========================
    // CHECK DUO SAVINGS
    // =========================
    if (!plan) {
        plan = await prisma.duoSavings.findUnique({
            where: {
                id: planId,
            },
        });

        if (plan) {
            SavingsModel = prisma.duoSavings;
            savingsType = "Duo";
        }
    }

    // =========================
    // CHECK FAMILY SAVINGS
    // =========================
    if (!plan) {
        plan = await prisma.familySavings.findUnique({
            where: {
                id: planId,
            },
        });

        if (plan) {
            SavingsModel = prisma.familySavings;
            savingsType = "Family";
        }
    }

    // Plan doesn't exist anywhere
    if (!plan) {
        return res.status(404).json({
            success: false,
            message: "Savings plan not found",
        });
    }

    // Only pending plans can be approved
    if (plan.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: `Savings plan is already ${plan.status.toLowerCase()}. Only pending plans can be approved.`,
        });
    }

    // =========================
    // APPROVE PLAN
    // =========================
    const approvedPlan = await SavingsModel.update({
        where: {
            id: planId,
        },
        data: {
            status: "ACTIVE",
            startDate: new Date(),
        },
    });

    return res.status(200).json({
        success: true,
        message: `${savingsType} savings plan approved successfully.`,
        data: {
            savingsType,
            savingsPlan: approvedPlan,
        },
    });
});
export const rejectSavingsPlan = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const { planId } = req.params;

    if (!planId) {
        return res.status(400).json({
            success: false,
            message: "Savings plan ID is required",
        });
    }

    let SavingsModel = null;
    let plan = null;
    let savingsType = null;

    // =========================
    // CHECK SINGLE SAVINGS
    // =========================
    plan = await prisma.singleSavings.findUnique({
        where: {
            id: planId,
        },
    });

    if (plan) {
        SavingsModel = prisma.singleSavings;
        savingsType = "Single";
    }

    // =========================
    // CHECK DUO SAVINGS
    // =========================
    if (!plan) {
        plan = await prisma.duoSavings.findUnique({
            where: {
                id: planId,
            },
        });

        if (plan) {
            SavingsModel = prisma.duoSavings;
            savingsType = "Duo";
        }
    }

    // =========================
    // CHECK FAMILY SAVINGS
    // =========================
    if (!plan) {
        plan = await prisma.familySavings.findUnique({
            where: {
                id: planId,
            },
        });

        if (plan) {
            SavingsModel = prisma.familySavings;
            savingsType = "Family";
        }
    }

    // Plan doesn't exist
    if (!plan) {
        return res.status(404).json({
            success: false,
            message: "Savings plan not found",
        });
    }

    // Only pending plans can be rejected
    if (plan.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: `Savings plan is already ${plan.status.toLowerCase()}. Only pending plans can be rejected.`,
        });
    }

    // =========================
    // REJECT PLAN
    // =========================
    const rejectedPlan = await SavingsModel.update({
        where: {
            id: planId,
        },
        data: {
            status: "REJECTED",
        },
    });

    return res.status(200).json({
        success: true,
        message: `${savingsType} savings plan rejected successfully.`,
        data: {
            savingsType,
            savingsPlan: rejectedPlan,
        },
    });
});

export const getAllPendingSavingsPlans = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    // Get all pending Single Savings
    const singleSavings = await prisma.singleSavings.findMany({
        where: {
            status: "PENDING",
        },
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
        orderBy: {
            createdAt: "asc",
        },
    });

    // Get all pending Duo Savings
    const duoSavings = await prisma.duoSavings.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    username: true,
                    email: true,
                },
            },

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
        orderBy: {
            createdAt: "asc",
        },
    });

    // Get all pending Family Savings
    const familySavings = await prisma.familySavings.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    username: true,
                    email: true,
                },
            },

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
        orderBy: {
            createdAt: "asc",
        },
    });

    // Add a savingsType to each result
    const formattedSingleSavings = singleSavings.map((plan) => ({
        ...plan,
        savingsType: "Single",
    }));

    const formattedDuoSavings = duoSavings.map((plan) => ({
        ...plan,
        savingsType: "Duo",
    }));

    const formattedFamilySavings = familySavings.map((plan) => ({
        ...plan,
        savingsType: "Family",
    }));

    // Combine all pending plans
    const pendingSavings = [
        ...formattedSingleSavings,
        ...formattedDuoSavings,
        ...formattedFamilySavings,
    ];

    // Sort everything by creation date
    pendingSavings.sort(
        (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
    );

    return res.status(200).json({
        success: true,
        message: "Pending savings plans retrieved successfully.",

        count: pendingSavings.length,

        data: {
            totalPending: pendingSavings.length,

            singleSavings: formattedSingleSavings,
            duoSavings: formattedDuoSavings,
            familySavings: formattedFamilySavings,

            allPending: pendingSavings,
        },
    });
});

export const approveSavingsDeposit = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const { depositId } = req.params;

    if (!depositId) {
        return res.status(400).json({
            success: false,
            message: "Deposit ID is required",
        });
    }

    let deposit = null;
    let savingsType = null;

    // =========================
    // CHECK DUO DEPOSIT
    // =========================

    deposit = await prisma.duoSavingsDeposit.findUnique({
        where: {
            id: depositId,
        },
    });

    if (deposit) {
        savingsType = "Duo";
    }

    // =========================
    // CHECK FAMILY DEPOSIT
    // =========================

    if (!deposit) {
        deposit = await prisma.familySavingsDeposit.findUnique({
            where: {
                id: depositId,
            },
        });

        if (deposit) {
            savingsType = "Family";
        }
    }

    // =========================
    // DEPOSIT DOESN'T EXIST
    // =========================

    if (!deposit) {
        return res.status(404).json({
            success: false,
            message: "Deposit not found",
        });
    }

    // =========================
    // ONLY PENDING DEPOSITS
    // =========================

    if (deposit.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: `Deposit is already ${deposit.status.toLowerCase()}. Only pending deposits can be approved.`,
        });
    }

    // =========================
    // APPROVE DEPOSIT + UPDATE PLAN
    // =========================

    const result = await prisma.$transaction(async (tx) => {
        let approvedDeposit;
        let savingsPlan;

        // =====================================
        // DUO SAVINGS
        // =====================================

        if (savingsType === "Duo") {
            savingsPlan = await tx.duoSavings.findUnique({
                where: {
                    id: deposit.duoSavingsId,
                },
            });

            if (!savingsPlan) {
                throw new Error("Duo savings plan not found");
            }

            // Calculate new balance
            const newAmountSaved =
                savingsPlan.amountSaved + deposit.amount;

            const newExpectedInterest =
                (newAmountSaved * savingsPlan.interestRate) / 100;

            const newTotalPayout =
                newAmountSaved + newExpectedInterest;

            // Approve deposit
            approvedDeposit =
                await tx.duoSavingsDeposit.update({
                    where: {
                        id: depositId,
                    },
                    data: {
                        status: "APPROVED",
                    },
                });

            // Credit the depositor's individual contribution
            await tx.duoSavingsParticipant.update({
                where: {
                    duoSavingsId_userId: {
                        duoSavingsId: deposit.duoSavingsId,
                        userId: deposit.depositedById,
                    },
                },
                data: {
                    contribution: { increment: deposit.amount },
                },
            });

            // Update savings plan
            savingsPlan =
                await tx.duoSavings.update({
                    where: {
                        id: deposit.duoSavingsId,
                    },
                    data: {
                        amountSaved: newAmountSaved,
                        expectedInterest: newExpectedInterest,
                        totalPayout: newTotalPayout,
                    },
                });
        }

        // =====================================
        // FAMILY SAVINGS
        // =====================================

        if (savingsType === "Family") {
            savingsPlan = await tx.familySavings.findUnique({
                where: {
                    id: deposit.familySavingsId,
                },
            });

            if (!savingsPlan) {
                throw new Error("Family savings plan not found");
            }

            // Calculate new balance
            const newAmountSaved =
                savingsPlan.amountSaved + deposit.amount;

            const newExpectedInterest =
                (newAmountSaved * savingsPlan.interestRate) / 100;

            const newTotalPayout =
                newAmountSaved + newExpectedInterest;

            // Approve deposit
            approvedDeposit =
                await tx.familySavingsDeposit.update({
                    where: {
                        id: depositId,
                    },
                    data: {
                        status: "APPROVED",
                    },
                });

            // Credit the depositor's individual contribution
            await tx.familySavingsParticipant.update({
                where: {
                    familySavingsId_userId: {
                        familySavingsId: deposit.familySavingsId,
                        userId: deposit.depositedById,
                    },
                },
                data: {
                    contribution: { increment: deposit.amount },
                },
            });

            // Update savings plan
            savingsPlan =
                await tx.familySavings.update({
                    where: {
                        id: deposit.familySavingsId,
                    },
                    data: {
                        amountSaved: newAmountSaved,
                        expectedInterest: newExpectedInterest,
                        totalPayout: newTotalPayout,
                    },
                });
        }

        return {
            approvedDeposit,
            savingsPlan,
        };
    });

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
        success: true,
        message:
            `${savingsType} savings deposit approved successfully. ` +
            `Amount, expected interest, and total payout have been updated.`,

        data: {
            savingsType,
            deposit: result.approvedDeposit,
            savingsPlan: result.savingsPlan,
        },
    });
});

export const rejectSavingsDeposit = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const { depositId } = req.params;

    if (!depositId) {
        return res.status(400).json({
            success: false,
            message: "Deposit ID is required",
        });
    }

    let deposit = null;
    let DepositModel = null;
    let savingsType = null;

    // =========================
    // CHECK DUO DEPOSIT
    // =========================

    deposit = await prisma.duoSavingsDeposit.findUnique({
        where: {
            id: depositId,
        },
    });

    if (deposit) {
        DepositModel = prisma.duoSavingsDeposit;
        savingsType = "Duo";
    }

    // =========================
    // CHECK FAMILY DEPOSIT
    // =========================

    if (!deposit) {
        deposit = await prisma.familySavingsDeposit.findUnique({
            where: {
                id: depositId,
            },
        });

        if (deposit) {
            DepositModel = prisma.familySavingsDeposit;
            savingsType = "Family";
        }
    }

    // Deposit doesn't exist
    if (!deposit) {
        return res.status(404).json({
            success: false,
            message: "Deposit not found",
        });
    }

    // Only pending deposits can be rejected
    if (deposit.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: `Deposit is already ${deposit.status.toLowerCase()}. Only pending deposits can be rejected.`,
        });
    }

    // =========================
    // REJECT DEPOSIT
    // =========================

    const rejectedDeposit = await DepositModel.update({
        where: {
            id: depositId,
        },
        data: {
            status: "REJECTED",
        },
    });

    return res.status(200).json({
        success: true,
        message: `${savingsType} savings deposit rejected successfully.`,
        data: {
            savingsType,
            deposit: rejectedDeposit,
        },
    });
});

export const getPendingSavingsDeposits = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    // =========================
    // GET PENDING DUO DEPOSITS
    // =========================

    const duoDeposits = await prisma.duoSavingsDeposit.findMany({
        where: {
            status: "PENDING",
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
                    interestRate: true,
                    expectedInterest: true,
                    totalPayout: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // =========================
    // GET PENDING FAMILY DEPOSITS
    // =========================

    const familyDeposits =
        await prisma.familySavingsDeposit.findMany({
            where: {
                status: "PENDING",
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
                familySavings: {
                    select: {
                        id: true,
                        amountSaved: true,
                        interestRate: true,
                        expectedInterest: true,
                        totalPayout: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    // =========================
    // ADD SAVINGS TYPE
    // =========================

    const formattedDuoDeposits = duoDeposits.map((deposit) => ({
        ...deposit,
        savingsType: "Duo",
    }));

    const formattedFamilyDeposits = familyDeposits.map(
        (deposit) => ({
            ...deposit,
            savingsType: "Family",
        })
    );

    // =========================
    // COMBINE BOTH
    // =========================

    const deposits = [
        ...formattedDuoDeposits,
        ...formattedFamilyDeposits,
    ].sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    return res.status(200).json({
        success: true,
        message: "Pending savings deposits retrieved successfully.",
        count: deposits.length,
        data: deposits,
    });
});

export const getPendingSingleSavingsWithdrawals = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const withdrawals = await prisma.singleSavingsWithdrawal.findMany({
        where: {
            status: "PENDING",
        },
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
            savingsPlan: {
                select: {
                    id: true,
                    amountSaved: true,
                    interestRate: true,
                    expectedInterest: true,
                    totalPayout: true,
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
        message: "Pending single savings withdrawals retrieved successfully.",
        count: withdrawals.length,
        data: withdrawals,
    });
});

export const approveSingleSavingsWithdrawal = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const { withdrawalId } = req.params;

    if (!withdrawalId) {
        return res.status(400).json({
            success: false,
            message: "Withdrawal ID is required",
        });
    }

    const withdrawal = await prisma.singleSavingsWithdrawal.findUnique({
        where: {
            id: withdrawalId,
        },
        include: {
            savingsPlan: true,
        },
    });

    if (!withdrawal) {
        return res.status(404).json({
            success: false,
            message: "Withdrawal not found",
        });
    }

    if (withdrawal.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: `Withdrawal is already ${withdrawal.status.toLowerCase()}. Only pending withdrawals can be approved.`,
        });
    }

    const plan = withdrawal.savingsPlan;

    const result = await prisma.$transaction(async (tx) => {
        let updatedPlan;

        if (plan.status === "MATURED") {
            const remainingBalance = plan.totalPayout - withdrawal.amount;

            updatedPlan = await tx.singleSavings.update({
                where: { id: plan.id },
                data: {
                    totalPayout: remainingBalance,
                    ...(remainingBalance <= 0 && { status: "WITHDRAWN" }),
                },
            });
        } else {
            const newAmountSaved = plan.amountSaved - withdrawal.amount;
            const newInterest = (newAmountSaved * plan.interestRate) / 100;
            const newTotalPayout = newAmountSaved + newInterest;

            updatedPlan = await tx.singleSavings.update({
                where: { id: plan.id },
                data: {
                    amountSaved: newAmountSaved,
                    expectedInterest: newInterest,
                    totalPayout: newTotalPayout,
                },
            });
        }

        const approvedWithdrawal = await tx.singleSavingsWithdrawal.update({
            where: { id: withdrawalId },
            data: { status: "SUCCESSFUL" },
        });

        return { approvedWithdrawal, updatedPlan };
    });

    return res.status(200).json({
        success: true,
        message: "Single savings withdrawal approved successfully.",
        data: {
            withdrawal: result.approvedWithdrawal,
            savingsPlan: result.updatedPlan,
        },
    });
});

export const rejectSingleSavingsWithdrawal = asyncHandler(async (req, res) => {
    const requester = req.admin;

    // Make sure requester is an admin
    if (!requester || requester.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action",
        });
    }

    const { withdrawalId } = req.params;

    if (!withdrawalId) {
        return res.status(400).json({
            success: false,
            message: "Withdrawal ID is required",
        });
    }

    const withdrawal = await prisma.singleSavingsWithdrawal.findUnique({
        where: {
            id: withdrawalId,
        },
    });

    if (!withdrawal) {
        return res.status(404).json({
            success: false,
            message: "Withdrawal not found",
        });
    }

    if (withdrawal.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: `Withdrawal is already ${withdrawal.status.toLowerCase()}. Only pending withdrawals can be rejected.`,
        });
    }

    const rejectedWithdrawal = await prisma.singleSavingsWithdrawal.update({
        where: { id: withdrawalId },
        data: { status: "REJECTED" },
    });

    return res.status(200).json({
        success: true,
        message: "Single savings withdrawal rejected successfully.",
        data: {
            withdrawal: rejectedWithdrawal,
        },
    });
});

export const getAllReportsByAdmin = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only admins can delete savings
  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }


  const reports = await prisma.report.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    data: reports,
  });
});

export const respondToReport = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only admins can delete savings
  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }


  const { id } = req.params;

  const {
    adminResponse,
    status,
  } = req.body;

  const report = await prisma.report.update({
    where: {
      id,
    },
    data: {
      adminResponse,
      status,
    },
  });

  res.status(200).json({
    success: true,
    message: "Response sent successfully.",
    data: report,
  });
});

export const deleteReport = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only admins can delete savings
  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }


  await prisma.report.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Report deleted successfully.",
  });
});

export const getAllConversations =
asyncHandler(async (req, res) => {
  const requester = req.admin;

  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }

    const conversations =
        await prisma.conversation.findMany({
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
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

    return res.status(200).json({
        success: true,
        data: conversations,
    });
});

export const adminReply =
asyncHandler(async (req, res) => {
  const requester = req.admin;

  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }

    const { conversationId } = req.params;

    const validator = new Validator();

    const { errors, value } = validator.validate(
        SendMessageRequest,
        req.body
    );

    if (errors) {
        throw new ValidationError(
            "Validation failed",
            errors
        );
    }

    const conversation =
        await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
        });

    if (!conversation) {
        throw new NotFoundError(
            "Conversation not found"
        );
    }

    const reply =
        await prisma.message.create({
            data: {
                conversationId,
                senderType: "ADMIN",
                message: value.message,
            },
        });
        io.to(`conversation:${conversationId}`).emit(
          "newMessage",
          reply
        );

    return res.status(201).json({
        success: true,
        message: "Reply sent successfully",
        data: reply,
    });
});

export const getUserSavingsByAdmin = asyncHandler(async (req, res) => {
  const requester = req.admin;

  // Only admins can perform this action
  if (!requester || requester.role !== "ADMIN") {
    throw new UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }

  const { userId } = req.params;

  // Check that the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      email: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Single Savings
  const singleSavings = await prisma.singleSavings.findMany({
    where: {
      userId,
    },
    include: {
      withdrawals: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Duo Savings (created by or participant)
  const duoSavings = await prisma.duoSavings.findMany({
    where: {
      OR: [
        {
          createdById: userId,
        },
        {
          participants: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      createdBy: true,
      participants: {
        include: {
          user: true,
        },
      },
      withdrawalRequests: true,
      deposits: { include: { depositedBy: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Family Savings (created by or participant)
  const familySavings = await prisma.familySavings.findMany({
    where: {
      OR: [
        {
          createdById: userId,
        },
        {
          participants: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      createdBy: true,
      participants: {
        include: {
          user: true,
        },
      },
      withdrawalRequests: true,
      deposits: { include: { depositedBy: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    message: "User savings retrieved successfully",
    data: {
      user,
      singleSavings,
      duoSavings,
      familySavings,
      summary: {
        totalSinglePlans: singleSavings.length,
        totalDuoPlans: duoSavings.length,
        totalFamilyPlans: familySavings.length,
        totalPlans:
          singleSavings.length +
          duoSavings.length +
          familySavings.length,
      },
    },
  });
});


