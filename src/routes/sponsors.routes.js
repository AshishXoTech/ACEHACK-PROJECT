const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const {
  validateCorporateEmail,
  isDisposableEmail,
  verifyMxRecords,
  verifyCompanyWebsite,
  verifyLinkedInCompanyPage,
  createVerificationToken,
  verificationExpiry,
} = require('../services/sponsor-verification.service');

const DUMMY_SPONSORS = [
  {
    companyName: 'CloudNova',
    industry: 'Cloud Infrastructure',
    website: 'https://cloudnova.example.com',
    technologies: 'Kubernetes, Terraform, Cloud APIs',
    sponsorshipType: 'Gold Sponsor',
    sponsorshipCriteria:
      'Minimum registrations: 1000+, Multi-college participation, Brand visibility on banners',
    contactEmail: 'partnerships@cloudnova.example.com',
  },
  {
    companyName: 'FinEdge Labs',
    industry: 'FinTech',
    website: 'https://finedge.example.com',
    technologies: 'Python, Payments API, Fraud Detection SDK',
    sponsorshipType: 'API Sponsor',
    sponsorshipCriteria:
      'Active mentoring booth, API challenge track, Logo placement across event media',
    contactEmail: 'sponsor@finedge.example.com',
  },
  {
    companyName: 'EduSpark',
    industry: 'EdTech',
    website: 'https://eduspark.example.com',
    technologies: 'LMS API, Analytics Toolkit, React',
    sponsorshipType: 'Community Sponsor',
    sponsorshipCriteria:
      'Student-first theme alignment, Cross-campus participation, Social media visibility',
    contactEmail: 'hello@eduspark.example.com',
  },
];

const DEFAULT_WHITELISTED_DOMAINS = [
  'google.com',
  'microsoft.com',
  'stripe.com',
  'openai.com',
  'aws.amazon.com',
];

const isSchemaMismatchError = (error) => {
  const message = String(error?.message || '');
  return (
    message.includes('Unknown arg') ||
    message.includes('no such column') ||
    message.includes('Invalid `prisma')
  );
};

const toSponsorDto = (sponsor) => ({
  id: String(sponsor.id),
  companyName: sponsor.companyName,
  industry: sponsor.industry,
  website: sponsor.website,
  companyWebsite: sponsor.companyWebsite || sponsor.website,
  domain: sponsor.domain || null,
  linkedinCompanyPage: sponsor.linkedinCompanyPage || null,
  technologies: sponsor.technologies
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  sponsorshipType: sponsor.sponsorshipType,
  sponsorshipCriteria: sponsor.sponsorshipCriteria,
  contactEmail: sponsor.contactEmail,
  verificationStatus: sponsor.verificationStatus || 'pending',
  emailVerified: Boolean(sponsor.emailVerified),
  domainVerified: Boolean(sponsor.domainVerified),
  websiteVerified: Boolean(sponsor.websiteVerified),
  linkedinVerified: Boolean(sponsor.linkedinVerified),
  status: sponsor.status || 'pending',
  createdAt: sponsor.createdAt,
});

async function ensureDefaultVerifiedDomains() {
  for (const domain of DEFAULT_WHITELISTED_DOMAINS) {
    try {
      await prisma.verifiedCompanyDomain.upsert({
        where: { domain },
        create: { domain, autoApprove: true },
        update: { autoApprove: true },
      });
    } catch {
      // If table is not migrated yet, fail gracefully.
      break;
    }
  }
}

router.get('/', async (req, res) => {
  try {
    let sponsors = [];
    try {
      sponsors = await prisma.sponsor.findMany({
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
      });
    } catch (queryError) {
      if (!isSchemaMismatchError(queryError)) {
        throw queryError;
      }
      sponsors = await prisma.sponsor.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (sponsors.length === 0) {
      return res.json(
        DUMMY_SPONSORS.map((sponsor, index) => ({
          id: `dummy-${index + 1}`,
          ...toSponsorDto({
            id: `dummy-${index + 1}`,
            ...sponsor,
            companyWebsite: sponsor.website,
            domain: sponsor.website.replace(/^https?:\/\//, '').split('/')[0],
            linkedinCompanyPage: 'https://linkedin.com/company/example',
            verificationStatus: 'approved',
            emailVerified: true,
            domainVerified: true,
            websiteVerified: true,
            linkedinVerified: true,
            status: 'approved',
            createdAt: new Date(),
          }),
        })),
      );
    }

    res.json(sponsors.map(toSponsorDto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const {
      companyName,
      industry,
      website,
      companyWebsite,
      linkedinCompanyPage,
      technologies,
      sponsorshipType,
      sponsorshipCriteria,
      contactEmail,
    } = req.body;

    if (
      !companyName ||
      !industry ||
      !(companyWebsite || website) ||
      !linkedinCompanyPage ||
      !technologies ||
      !sponsorshipType ||
      !sponsorshipCriteria ||
      !contactEmail
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = String(contactEmail).trim().toLowerCase();
    const normalizedWebsite = String(companyWebsite || website).trim();
    const normalizedLinkedIn = String(linkedinCompanyPage).trim();

    const corporate = validateCorporateEmail(normalizedEmail);
    if (!corporate.valid) {
      return res.status(400).json({ message: corporate.reason || 'Corporate email is required' });
    }

    if (isDisposableEmail(corporate.domain)) {
      return res.status(400).json({ message: 'Disposable email domains are not allowed' });
    }

    const hasMx = await verifyMxRecords(corporate.domain);
    if (!hasMx) {
      return res.status(400).json({ message: 'Email domain is invalid (MX record not found)' });
    }

    const websiteCheck = await verifyCompanyWebsite(normalizedWebsite, corporate.domain);
    if (!websiteCheck.reachable) {
      return res.status(400).json({ message: websiteCheck.reason || 'Company website is not reachable' });
    }

    const linkedInCheck = await verifyLinkedInCompanyPage(normalizedLinkedIn);
    if (!linkedInCheck.valid) {
      return res.status(400).json({ message: linkedInCheck.reason || 'Invalid LinkedIn company page' });
    }

    await ensureDefaultVerifiedDomains();

    const domainRecord = await prisma.verifiedCompanyDomain.findUnique({
      where: { domain: corporate.domain },
    }).catch(() => null);

    const verificationToken = createVerificationToken();
    const verificationExpires = verificationExpiry();

    const normalizedTechnologies = Array.isArray(technologies)
      ? technologies.map((item) => String(item).trim()).filter(Boolean).join(', ')
      : String(technologies);

    const autoApproved = Boolean(domainRecord?.autoApprove) && websiteCheck.domainMatches;

    let sponsor;
    try {
      sponsor = await prisma.sponsor.create({
        data: {
          companyName: String(companyName).trim(),
          industry: String(industry).trim(),
          website: normalizedWebsite,
          companyWebsite: normalizedWebsite,
          domain: corporate.domain,
          linkedinCompanyPage: normalizedLinkedIn,
          technologies: normalizedTechnologies,
          sponsorshipType: String(sponsorshipType).trim(),
          sponsorshipCriteria: String(sponsorshipCriteria).trim(),
          contactEmail: normalizedEmail,
          emailVerified: false,
          domainVerified: hasMx,
          websiteVerified: websiteCheck.reachable,
          linkedinVerified: linkedInCheck.valid,
          verificationStatus: websiteCheck.manualReview ? 'manual_review' : 'verified',
          status: autoApproved ? 'approved' : 'pending',
          verificationToken,
          verificationExpires,
        },
      });
    } catch (createError) {
      if (!isSchemaMismatchError(createError)) {
        throw createError;
      }

      sponsor = await prisma.sponsor.create({
        data: {
          companyName: String(companyName).trim(),
          industry: String(industry).trim(),
          website: normalizedWebsite,
          technologies: normalizedTechnologies,
          sponsorshipType: String(sponsorshipType).trim(),
          sponsorshipCriteria: String(sponsorshipCriteria).trim(),
          contactEmail: normalizedEmail,
        },
      });
    }

    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    console.log('[Sponsor Verification] Send email verification link:', verifyUrl);

    res.status(201).json({
      ...toSponsorDto(sponsor),
      message: 'Sponsor submitted. Verify your email. Final access requires admin approval.',
      emailVerificationSent: true,
      emailVerificationExpiresAt: verificationExpires,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get(
  '/admin/list',
  authMiddleware,
  roleMiddleware('organizer'),
  async (req, res) => {
    try {
      const sponsors = await prisma.sponsor.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(sponsors.map(toSponsorDto));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

router.post(
  '/admin/:sponsorId/status',
  authMiddleware,
  roleMiddleware('organizer'),
  async (req, res) => {
    try {
      const sponsorId = Number(req.params.sponsorId);
      const action = String(req.body?.action || '').toLowerCase();

      if (Number.isNaN(sponsorId)) {
        return res.status(400).json({ message: 'Invalid sponsor id' });
      }

      if (!['approve', 'reject', 'request_verification'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }

      const update =
        action === 'approve'
          ? { status: 'approved', verificationStatus: 'approved' }
          : action === 'reject'
            ? { status: 'rejected', verificationStatus: 'rejected' }
            : { status: 'pending', verificationStatus: 'manual_review' };

      const sponsor = await prisma.sponsor.update({
        where: { id: sponsorId },
        data: update,
      });

      res.json(toSponsorDto(sponsor));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

router.get(
  '/access',
  authMiddleware,
  roleMiddleware('sponsor'),
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(req.user.id) },
        select: { email: true },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const sponsor = await prisma.sponsor.findFirst({
        where: { contactEmail: String(user.email || '').toLowerCase() },
      });

      if (!sponsor) {
        return res.status(404).json({ message: 'Sponsor profile not found' });
      }

      if (!sponsor.emailVerified) {
        return res.status(403).json({ message: 'Verify your email to continue' });
      }

      if (sponsor.status !== 'approved') {
        return res.status(403).json({ message: 'Sponsor access pending admin approval' });
      }

      return res.json({ access: true, status: sponsor.status });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
);

module.exports = router;
