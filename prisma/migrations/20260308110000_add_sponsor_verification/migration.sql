ALTER TABLE "Sponsor" ADD COLUMN "companyWebsite" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "domain" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "linkedinCompanyPage" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Sponsor" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sponsor" ADD COLUMN "domainVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sponsor" ADD COLUMN "websiteVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sponsor" ADD COLUMN "linkedinVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sponsor" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Sponsor" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "verificationExpires" DATETIME;

CREATE TABLE "VerifiedCompanyDomain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "autoApprove" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "VerifiedCompanyDomain_domain_key" ON "VerifiedCompanyDomain"("domain");
