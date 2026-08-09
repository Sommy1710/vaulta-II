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
    res.cookie("authentication", token);
    return res.status(200).json({success: true, message: "admin successfully logged in"});

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

  const { type, id } = req.params;

  let model;

  switch (type.toLowerCase()) {
    case "single":
      model = prisma.singleSavings;
      break;

    case "duo":
      model = prisma.duoSavings;
      break;

    case "family":
      model = prisma.familySavings;
      break;

    default:
      return res.status(400).json({
        success: false,
        message:
          "Invalid savings type. Use single, duo or family.",
      });
  }

  // Check if the savings record exists
  const savings = await model.findUnique({
    where: { id },
  });

  if (!savings) {
    return res.status(404).json({
      success: false,
      message: "Savings record not found",
    });
  }

  // Delete the savings record
  await model.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: `${type} savings record deleted successfully`,
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


