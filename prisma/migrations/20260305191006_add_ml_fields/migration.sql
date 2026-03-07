-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "complexity" TEXT,
ADD COLUMN     "techStack" TEXT,
ALTER COLUMN "summary" DROP NOT NULL,
ALTER COLUMN "classification" DROP NOT NULL;
