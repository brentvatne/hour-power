/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[token]` on the table `User`. If there are existing duplicate values, the migration will fail.
  - Added the required column `token` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User.token_unique" ON "User"("token");
