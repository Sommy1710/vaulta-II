import {prisma} from "../../config/db.prisma.js";
import {ConflictError, NotFoundError} from '../../lib/error-definitions.js';
//import {User} from './user.schema.js';
import argon2 from "argon2";

export const createUser = async (payload) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: payload.email },
        { username: payload.username }
      ]
    }
  });

  if (existingUser) {
    throw new ConflictError(
      "A user with the provided details already exists"
    );
  }

  const hashedPassword = await argon2.hash(payload.password);

  return await prisma.user.create({
    data: {
      firstname: payload.firstname,
      lastname: payload.lastname,
      username: payload.username,
      email: payload.email,
      password: hashedPassword,

      role: payload.role ?? "USER",

      isEmailVerified: payload.isEmailVerified ?? false,

      emailVerificationCode: payload.emailVerificationCode,
      emailCodeExpiry: payload.emailCodeExpiry,

      passwordResetCode: payload.passwordResetCode,
      passwordResetExpiry: payload.passwordResetExpiry,

      isDeleted: payload.isDeleted ?? false,
      deleteRequestedAt: payload.deleteRequestedAt,
    },
  });
};
export const getUser = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id
    }
  });
};

export const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email
    }
  });
};

export const getUserByRole = async (role) => {
  return await prisma.user.findMany({
    where: {
      role
    }
  });
};

export const deleteUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new NotFoundError("user not found");
  }

  await prisma.user.delete({
    where: {
      id: userId
    }
  });

  return {
    success: true,
    message: "user deleted successfully"
  };
};