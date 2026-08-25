-- CreateEnum
CREATE TYPE "DuoDepositStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FamilyDepositStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "DuoSavingsStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "FamilySavingsStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "SavingsStatus" ADD VALUE 'REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WithdrawalStatus" ADD VALUE 'PENDING';
ALTER TYPE "WithdrawalStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "duo_savings" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "family_savings" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "single_savings" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "single_savings_withdrawals" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "duo_savings_deposits" (
    "id" TEXT NOT NULL,
    "duoSavingsId" TEXT NOT NULL,
    "depositedById" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "DuoDepositStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duo_savings_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_savings_deposits" (
    "id" TEXT NOT NULL,
    "familySavingsId" TEXT NOT NULL,
    "depositedById" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "FamilyDepositStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_savings_deposits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "duo_savings_deposits" ADD CONSTRAINT "duo_savings_deposits_duoSavingsId_fkey" FOREIGN KEY ("duoSavingsId") REFERENCES "duo_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_deposits" ADD CONSTRAINT "duo_savings_deposits_depositedById_fkey" FOREIGN KEY ("depositedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_deposits" ADD CONSTRAINT "family_savings_deposits_familySavingsId_fkey" FOREIGN KEY ("familySavingsId") REFERENCES "family_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_deposits" ADD CONSTRAINT "family_savings_deposits_depositedById_fkey" FOREIGN KEY ("depositedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
