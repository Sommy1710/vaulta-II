import {prisma} from "../../config/db.prisma.js";
import {asyncHandler} from '../../lib/util.js';
import argon from 'argon2';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import {CreateUserRequest, UpdateUserRequest, ChangeUserPasswordRequest} from './create-user.request.js';
import { AuthUserRequest, } from './auth-user.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
//import {User} from './user.schema.js';
import {sendEmail} from '../../lib/emailService.js';
import { deleteUserById } from './user.service.js';
import * as userService from './user.service.js';
import config from '../../config/app.config.js';
import { UnauthorizedError, NotFoundError, UnauthenticatedError } from '../../lib/error-definitions.js';
import {io} from "../../bootstrap/server.js";


//function to generate a 4-digit OTP

function generateOTP() {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
};

export const createUserAccount = asyncHandler(async (req, res) => {
    const validator = new Validator();
    const { value, errors } = validator.validate(CreateUserRequest, req.body);

    if (errors) {
        throw new ValidationError(
            'The request failed with the following errors',
            errors
        );
    }


    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const userData = {
        ...value,
        emailVerificationCode: otpCode,
        emailCodeExpiry: otpExpiry,
        isEmailVerified: false,
    };

    await authService.registerUser(userData);

    try {
        await sendEmail({
            to: value.email,
            subject: 'Your verification code',
            html: `
                <p>Thank you for registering on Vaulta!</p>
                <p>Your verification code is: <strong>${otpCode}</strong></p>
                <p>This code expires in 10 minutes.</p>
            `
        });
        console.log('OTP email sent successfully.');
    } catch (err) {
        console.warn('Failed to send OTP email', err.message);
    }

    return res.status(201).json({
        message: 'User registered successfully. OTP sent to email.',
        data: {
            email: value.email,
            expiresAt: otpExpiry
        }
    });
});

export const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified.' });
  }

  const now = new Date();
  if (user.emailVerificationCode !== otp || now > user.emailCodeExpiry) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  await prisma.user.update({
  where: {
    id: user.id
  },
  data: {
    isEmailVerified: true,
    emailVerificationCode: null,
    emailCodeExpiry: null
  }
});

  return res.status(200).json({ message: 'Email verified successfully.' });
});

export const authenticateUser = asyncHandler(async(req, res) => {
  const validator = new Validator();
  const {value, errors} = validator.validate(AuthUserRequest, req.body);
  if (errors) throw new ValidationError('the request failed with the following errors', errors);

  const user = await userService.getUserByEmail(value.email);
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }
  if (!user.isEmailVerified) {
    //generate new OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //10 minutes


    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        emailVerificationCode: otpCode,
        emailCodeExpiry: otpExpiry
      }
    })

   

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        html: `
            <p>Your email is not verified.</p>
            <p>Your new verification code is: <strong>${otpCode}</strong></p>
            <p>This code expires in 10 minutes. </p>`
      });
      console.log('verification OTP resent');

    } catch (err) {
      console.warn('Failed to send verification email', err.message);
    }
    return res.status(403).json({
      message: 'Email not verified. A new OTP has been sent to your email.',
      data: {
        email: user.email,
        expiresAt: otpExpiry
      }
    });
  }
  const token = await authService.authenticateUser(value, req);
  res.cookie("authentication", token, {
    httpOnly: true,
    secure: config.environment === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({success: true, message: "user successfully logged in"});

});

export const getAuthenticatedUser = asyncHandler(async(req, res) =>
{
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true, firstname: true, lastname: true, username: true,
            email: true, role: true, isEmailVerified: true, createdAt: true,
        },
    });
    if (!user) throw new NotFoundError('User not found');
    return res.status(200).json({
        success: true,
        message: "user found successfully",
        data: { user },
    });
});

export const findUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ success: false, message: 'username query param required' });

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, firstname: true, lastname: true, username: true, email: true },
  });

  if (!user) return res.status(404).json({ success: false, message: 'No user found with that username' });

  return res.status(200).json({ success: true, data: { user } });
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const [user, singlePlans, duoAsCreator, duoAsParticipant, familyAsCreator, familyAsParticipant] =
        await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, firstname: true, lastname: true, username: true,
                    email: true, role: true, createdAt: true,
                },
            }),
            prisma.singleSavings.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.duoSavings.findMany({
                where: { createdById: userId },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.duoSavingsParticipant.findMany({
                where: { userId },
                include: { duoSavings: true },
            }),
            prisma.familySavings.findMany({
                where: { createdById: userId },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.familySavingsParticipant.findMany({
                where: { userId },
                include: { familySavings: true },
            }),
        ]);

    if (!user) throw new NotFoundError('User not found');

    // Merge duo plans (creator + participant, deduplicated)
    const duoParticipantPlans = duoAsParticipant.map((p) => p.duoSavings);
    const duoMap = new Map();
    [...duoAsCreator, ...duoParticipantPlans].forEach((p) => duoMap.set(p.id, p));
    const duoPlans = Array.from(duoMap.values());

    // Merge family plans
    const familyParticipantPlans = familyAsParticipant.map((p) => p.familySavings);
    const familyMap = new Map();
    [...familyAsCreator, ...familyParticipantPlans].forEach((p) => familyMap.set(p.id, p));
    const familyPlans = Array.from(familyMap.values());

    // Count all non-withdrawn plans (ACTIVE + MATURED both have live balances)
    const activeSingle = singlePlans.filter((p) => p.status !== 'WITHDRAWN');
    const activeDuo    = duoPlans.filter((p) => p.status !== 'WITHDRAWN');
    const activeFamily = familyPlans.filter((p) => p.status !== 'WITHDRAWN');

    const totalBalance =
        activeSingle.reduce((s, p) => s + (p.totalPayout || 0), 0) +
        activeDuo.reduce((s, p) => s + (p.totalPayout || 0), 0) +
        activeFamily.reduce((s, p) => s + (p.totalPayout || 0), 0);

    const totalSaved =
        activeSingle.reduce((s, p) => s + (p.amountSaved || 0), 0) +
        activeDuo.reduce((s, p) => s + (p.amountSaved || 0), 0) +
        activeFamily.reduce((s, p) => s + (p.amountSaved || 0), 0);

    const totalYield = totalBalance - totalSaved;

    // Determine highest active plan
    let currentPlan = null;
    let currentRate = 0;
    if (activeFamily.length > 0) { currentPlan = 'Family Plan'; currentRate = 30; }
    else if (activeDuo.length > 0)    { currentPlan = 'Duo Plan';    currentRate = 15; }
    else if (activeSingle.length > 0) { currentPlan = 'Solo Plan';   currentRate = 10; }

    // Recent activity: latest 5 transactions across all plan histories combined
    const recentActivity = [
        ...singlePlans.map((p) => ({
            name: 'Single Savings Deposit',
            date: p.createdAt,
            amount: p.amountSaved,
            type: 'deposit',
            category: 'Deposit',
            planType: 'SINGLE',
        })),
        ...duoPlans.map((p) => ({
            name: 'Duo Savings Deposit',
            date: p.createdAt,
            amount: p.amountSaved,
            type: 'deposit',
            category: 'Deposit',
            planType: 'DUO',
        })),
        ...familyPlans.map((p) => ({
            name: 'Family Savings Deposit',
            date: p.createdAt,
            amount: p.amountSaved,
            type: 'deposit',
            category: 'Deposit',
            planType: 'FAMILY',
        })),
    ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return res.status(200).json({
        success: true,
        data: {
            user,
            summary: {
                totalBalance,
                totalSaved,
                totalYield,
                currentPlan,
                currentRate,
                activeSingleCount: activeSingle.length,
                activeDuoCount: activeDuo.length,
                activeFamilyCount: activeFamily.length,
            },
            recentActivity,
        },
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('authentication', {
    httpOnly: true,
    secure: config.environment === 'production',
    sameSite: 'Strict'
  });

  return res.status(200).json({ success: true, message: 'User successfully logged out' });
});

export const updateUserAccount =asyncHandler(async(req, res) => {
  const {userId} = req.params;
  const requester = req.user;

  const isAdmin = requester.role === "ADMIN";
  const isSelf = requester.id === userId;

  if (!isAdmin && !isSelf) {
    throw new UnauthorizedError(
      "you are not authorized to update this account"
    );
  }
  const validator = new Validator();
  const {value, errors} = validator.validate(
    UpdateUserRequest,
    req.body
  );

  if (errors) {
    throw new ValidationError(
      "the request failed with the following errors",
      errors
    );
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

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: value,
  });

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      user: updatedUser,
    },
  });
});



export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const otpCode = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
  where: {
    id: user.id
  },
  data: {
    passwordResetCode: otpCode,
    passwordResetExpiry: otpExpiry
  }
});

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Code',
      html: `
        <p>You requested to reset your password.</p>
        <p>Your password reset code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });
    console.log('Password reset OTP sent.');
  } catch (err) {
    console.warn('Failed to send password reset email', err.message);
  }

  return res.status(200).json({
    message: 'Password reset code sent to email.',
    data: {
      email: user.email,
      expiresAt: otpExpiry
    }
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const now = new Date();
  if (
    user.passwordResetCode !== otp ||
    !user.passwordResetExpiry ||
    now > user.passwordResetExpiry
  ) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  const hashedPassword = await argon.hash(newPassword);

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExpiry: null
    }
  });


  return res.status(200).json({ message: 'Password reset successfully.' });
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requester = req.user;

  // Allow if requester is admin
  const isAdmin = requester.role === "ADMIN";

  //  Allow if requester is deleting their own account
  const isSelf = requester.id === userId;

  if (!isAdmin && !isSelf) {
    throw new UnauthorizedError("You are not authorized to delete this account");
  }

  const deleted = await deleteUserById(userId);

  res.status(200).json({
    success: true,
    message: "User account deleted successfully"
  });
});

export const reportProblem = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const {
    category,
    subject,
    description,
  } = req.body;

  if (!category || !subject || !description) {
    return res.status(400).json({
      success: false,
      message: "Category, subject and description are required.",
    });
  }

  const report = await prisma.report.create({
    data: {
      userId,
      category,
      subject,
      description,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Problem reported successfully.",
    data: report,
  });
});

export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await prisma.report.findMany({
    where: {
      userId: req.user.id,
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