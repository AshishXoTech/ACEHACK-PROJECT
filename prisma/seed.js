const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VERIFIED_DOMAINS = [
  'google.com',
  'microsoft.com',
  'stripe.com',
  'openai.com',
  'aws.amazon.com',
];

async function main() {
  for (const domain of VERIFIED_DOMAINS) {
    await prisma.verifiedCompanyDomain.upsert({
      where: { domain },
      create: { domain, autoApprove: true },
      update: { autoApprove: true },
    });
  }

  console.log('Seeded verified company domains:', VERIFIED_DOMAINS.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
