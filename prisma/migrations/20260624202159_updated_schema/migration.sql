-- CreateEnum
CREATE TYPE "FamilyInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FamilyWithdrawalRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "FamilySavingsStatus" AS ENUM ('PENDING', 'ACTIVE', 'MATURED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "duo_savings" ALTER COLUMN "interestRate" SET DEFAULT 15,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "single_savings" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "family_savings" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "amountSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "expectedInterest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "status" "FamilySavingsStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastCompoundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_savings_participants" (
    "id" TEXT NOT NULL,
    "familySavingsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_savings_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_savings_invites" (
    "id" TEXT NOT NULL,
    "familySavingsId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "status" "FamilyInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_savings_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_savings_withdrawal_requests" (
    "id" TEXT NOT NULL,
    "familySavingsId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "creatorApproved" BOOLEAN NOT NULL DEFAULT false,
    "partnerApproved" BOOLEAN NOT NULL DEFAULT false,
    "status" "FamilyWithdrawalRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_savings_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "family_savings_participants_familySavingsId_userId_key" ON "family_savings_participants"("familySavingsId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "family_savings_invites_familySavingsId_invitedUserId_key" ON "family_savings_invites"("familySavingsId", "invitedUserId");

-- AddForeignKey
ALTER TABLE "family_savings" ADD CONSTRAINT "family_savings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_participants" ADD CONSTRAINT "family_savings_participants_familySavingsId_fkey" FOREIGN KEY ("familySavingsId") REFERENCES "family_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_participants" ADD CONSTRAINT "family_savings_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_invites" ADD CONSTRAINT "family_savings_invites_familySavingsId_fkey" FOREIGN KEY ("familySavingsId") REFERENCES "family_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_invites" ADD CONSTRAINT "family_savings_invites_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_withdrawal_requests" ADD CONSTRAINT "family_savings_withdrawal_requests_familySavingsId_fkey" FOREIGN KEY ("familySavingsId") REFERENCES "family_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_savings_withdrawal_requests" ADD CONSTRAINT "family_savings_withdrawal_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
