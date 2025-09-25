/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `UserFavoriteNote` table. All the data in the column will be lost.
  - You are about to drop the column `viewedAt` on the `ViewedNote` table. All the data in the column will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,noteId]` on the table `ViewedNote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionNumber` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `options` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserFavoriteNote" DROP CONSTRAINT "UserFavoriteNote_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserFavoriteNote" DROP CONSTRAINT "UserFavoriteNote_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ViewedNote" DROP CONSTRAINT "ViewedNote_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ViewedNote" DROP CONSTRAINT "ViewedNote_userId_fkey";

-- DropIndex
DROP INDEX "public"."ViewedNote_userId_viewedAt_idx";

-- AlterTable
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Account_id_seq";

-- AlterTable
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "answer",
DROP COLUMN "quizId",
ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "questionNumber" INTEGER NOT NULL,
ADD COLUMN     "testId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "options",
ADD COLUMN     "options" JSONB NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserFavoriteNote" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "public"."ViewedNote" DROP COLUMN "viewedAt";

-- DropTable
DROP TABLE "public"."Quiz";

-- CreateTable
CREATE TABLE "public"."Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "timeLimit" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestAttempt" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "correctCount" INTEGER,
    "totalQuestions" INTEGER,
    "timeSpent" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_settings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MaintenanceMode" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceMode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Test_category_idx" ON "public"."Test"("category");

-- CreateIndex
CREATE INDEX "Test_difficulty_idx" ON "public"."Test"("difficulty");

-- CreateIndex
CREATE INDEX "Test_isPublished_idx" ON "public"."Test"("isPublished");

-- CreateIndex
CREATE INDEX "Test_createdBy_idx" ON "public"."Test"("createdBy");

-- CreateIndex
CREATE INDEX "Test_createdAt_idx" ON "public"."Test"("createdAt");

-- CreateIndex
CREATE INDEX "TestAttempt_testId_idx" ON "public"."TestAttempt"("testId");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_idx" ON "public"."TestAttempt"("userId");

-- CreateIndex
CREATE INDEX "TestAttempt_isCompleted_idx" ON "public"."TestAttempt"("isCompleted");

-- CreateIndex
CREATE INDEX "TestAttempt_createdAt_idx" ON "public"."TestAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE INDEX "Note_slug_idx" ON "public"."Note"("slug");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "public"."Note"("userId");

-- CreateIndex
CREATE INDEX "Note_category_idx" ON "public"."Note"("category");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "public"."Note"("createdAt");

-- CreateIndex
CREATE INDEX "Question_testId_idx" ON "public"."Question"("testId");

-- CreateIndex
CREATE INDEX "Question_questionNumber_idx" ON "public"."Question"("questionNumber");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "UserFavoriteNote_userId_idx" ON "public"."UserFavoriteNote"("userId");

-- CreateIndex
CREATE INDEX "UserFavoriteNote_noteId_idx" ON "public"."UserFavoriteNote"("noteId");

-- CreateIndex
CREATE INDEX "ViewedNote_userId_idx" ON "public"."ViewedNote"("userId");

-- CreateIndex
CREATE INDEX "ViewedNote_noteId_idx" ON "public"."ViewedNote"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewedNote_userId_noteId_key" ON "public"."ViewedNote"("userId", "noteId");

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ViewedNote" ADD CONSTRAINT "ViewedNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ViewedNote" ADD CONSTRAINT "ViewedNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFavoriteNote" ADD CONSTRAINT "UserFavoriteNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFavoriteNote" ADD CONSTRAINT "UserFavoriteNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Test" ADD CONSTRAINT "Test_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
