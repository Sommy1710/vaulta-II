-- CreateEnum
CREATE TYPE "DuoInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DuoWithdrawalRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "DuoSavingsStatus" AS ENUM ('PENDING', 'ACTIVE', 'MATURED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "duo_savings" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "amountSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "expectedInterest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "status" "DuoSavingsStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastCompoundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duo_savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duo_savings_participants" (
    "id" TEXT NOT NULL,
    "duoSavingsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duo_savings_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duo_savings_invites" (
    "id" TEXT NOT NULL,
    "duoSavingsId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "status" "DuoInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duo_savings_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duo_savings_withdrawal_requests" (
    "id" TEXT NOT NULL,
    "duoSavingsId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "creatorApproved" BOOLEAN NOT NULL DEFAULT false,
    "partnerApproved" BOOLEAN NOT NULL DEFAULT false,
    "status" "DuoWithdrawalRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duo_savings_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "duo_savings_participants_duoSavingsId_userId_key" ON "duo_savings_participants"("duoSavingsId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "duo_savings_invites_duoSavingsId_invitedUserId_key" ON "duo_savings_invites"("duoSavingsId", "invitedUserId");

-- AddForeignKey
ALTER TABLE "duo_savings" ADD CONSTRAINT "duo_savings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_participants" ADD CONSTRAINT "duo_savings_participants_duoSavingsId_fkey" FOREIGN KEY ("duoSavingsId") REFERENCES "duo_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_participants" ADD CONSTRAINT "duo_savings_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_invites" ADD CONSTRAINT "duo_savings_invites_duoSavingsId_fkey" FOREIGN KEY ("duoSavingsId") REFERENCES "duo_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_invites" ADD CONSTRAINT "duo_savings_invites_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_withdrawal_requests" ADD CONSTRAINT "duo_savings_withdrawal_requests_duoSavingsId_fkey" FOREIGN KEY ("duoSavingsId") REFERENCES "duo_savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo_savings_withdrawal_requests" ADD CONSTRAINT "duo_savings_withdrawal_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
