-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
ALTER COLUMN "transactionDate" SET DEFAULT CURRENT_TIMESTAMP;
