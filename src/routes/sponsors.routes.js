const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

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

const toSponsorDto = (sponsor) => ({
  id: String(sponsor.id),
  companyName: sponsor.companyName,
  industry: sponsor.industry,
  website: sponsor.website,
  technologies: sponsor.technologies
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  sponsorshipType: sponsor.sponsorshipType,
  sponsorshipCriteria: sponsor.sponsorshipCriteria,
  contactEmail: sponsor.contactEmail,
});

router.get('/', async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (sponsors.length === 0) {
      return res.json(
        DUMMY_SPONSORS.map((sponsor, index) => ({
          id: `dummy-${index + 1}`,
          ...toSponsorDto({ id: `dummy-${index + 1}`, ...sponsor }),
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
      technologies,
      sponsorshipType,
      sponsorshipCriteria,
      contactEmail,
    } = req.body;

    if (
      !companyName ||
      !industry ||
      !website ||
      !technologies ||
      !sponsorshipType ||
      !sponsorshipCriteria ||
      !contactEmail
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedTechnologies = Array.isArray(technologies)
      ? technologies.map((item) => String(item).trim()).filter(Boolean).join(', ')
      : String(technologies);

    const sponsor = await prisma.sponsor.create({
      data: {
        companyName: String(companyName).trim(),
        industry: String(industry).trim(),
        website: String(website).trim(),
        technologies: normalizedTechnologies,
        sponsorshipType: String(sponsorshipType).trim(),
        sponsorshipCriteria: String(sponsorshipCriteria).trim(),
        contactEmail: String(contactEmail).trim().toLowerCase(),
      },
    });

    res.status(201).json(toSponsorDto(sponsor));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
