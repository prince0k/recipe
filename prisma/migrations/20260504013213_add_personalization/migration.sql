-- AlterTable
ALTER TABLE "Content" ADD COLUMN "painPointQuestions" TEXT DEFAULT '[]';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "leadData" TEXT DEFAULT '{}';

-- CreateTable
CREATE TABLE "PersonalizedRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "generatedPrompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalizedRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PersonalizedRequest_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
