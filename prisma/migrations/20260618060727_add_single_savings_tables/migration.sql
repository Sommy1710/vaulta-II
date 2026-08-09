-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('SINGLE');

-- CreateEnum
CREATE TYPE "SavingsStatus" AS ENUM ('PENDING', 'ACTIVE', 'MATURED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('SUCCESSFUL');

-- CreateTable
CREATE TABLE "single_savings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'SINGLE',
    "amountSaved" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "expectedInterest" DOUBLE PRECISION NOT NULL,
    "totalPayout" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "status" "SavingsStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastCompoundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "single_savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "single_savings_withdrawals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savingsPlanId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'SUCCESSFUL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "single_savings_withdrawals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "single_savings" ADD CONSTRAINT "single_savings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "single_savings_withdrawals" ADD CONSTRAINT "single_savings_withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "single_savings_withdrawals" ADD CONSTRAINT "single_savings_withdrawals_savingsPlanId_fkey" FOREIGN KEY ("savingsPlanId") REFERENCES "single_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
