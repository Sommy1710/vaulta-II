import { prisma } from "../../config/db.prisma.js";
import argon2 from "argon2";
import {
  ConflictError,
  NotFoundError,
} from "../../lib/error-definitions.js";

export const createAdmin = async (payload) => {
  // Check if admin already exists
  const admin = await prisma.admin.findFirst({
    where: {
      OR: [
        {
          email: payload.email,
        },
        {
          username: payload.username,
        },
      ],
    },
  });

  if (admin) {
    throw new ConflictError(
      "an admin with the provided details already exists"
    );
  }

  const hashedPassword = await argon2.hash(
    payload.password
  );

  return await prisma.admin.create({
    data: {
        ...payload,
        password: hashedPassword,
    },
  });
};

export const getAdmin = async (id) => {
  return await prisma.admin.findUnique({
    where: {
      id,
    },
  });
};

export const getAdminByEmail = async (email) => {
  return await prisma.admin.findFirst({
    where: {
      email,
    },
  });
};

export const getAdminByRole = async (role) => {
  return await prisma.admin.findMany({
    where: {
      role,
    },
  });
};

export const deleteAdminById = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!admin) {
    throw new NotFoundError(
      "admin not found"
    );
  }

  await prisma.admin.delete({
    where: {
      id: adminId,
    },
  });

  return {
    success: true,
    message: "admin deleted successfully",
  };
};