-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('BITCOIN', 'ETHEREUM');

-- AlterTable
ALTER TABLE "family_savings_withdrawal_requests" ADD COLUMN     "WalletType" "WalletType",
ADD COLUMN     "walletAddress" TEXT;
