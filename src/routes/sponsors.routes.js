const express = require('express');
const router = express.Router();

// DUMMY DATA FALLBACK: remove this in-memory dataset after adding persistent storage.
const defaultSponsors = [
  {
    id: 'github',
    companyName: 'GitHub',
    logoUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    industry: 'Developer Platform',
    website: 'https://github.com',
    about: 'GitHub helps developers build, ship, and collaborate on software at scale.',
    sponsorshipType: 'Developer Tools + APIs',
    sponsorshipCriteria:
      'Minimum registrations: 1000+\nOpen-source focused hackathons preferred\nBrand visibility on event website and banners',
    technologies: ['GitHub API', 'GitHub Copilot'],
    contactEmail: 'partnerships@github.com',
    cashPrizeContribution: '$5000',
    apiCredits: 'GitHub API + Copilot access',
    cloudCredits: '',
    mentorshipSupport: true,
    judgingParticipation: true,
    workshopsOrTechTalks: true,
    swagOrMerchandise: true,
    pastHackathons: ['AceHack 2024', 'DevSprint India'],
    linkedinPage: 'https://www.linkedin.com/company/github/',
  },
  {
    id: 'aws',
    companyName: 'AWS',
    logoUrl: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png',
    industry: 'Cloud Computing',
    website: 'https://aws.amazon.com',
    about: 'AWS provides cloud infrastructure and managed services for startups and enterprises.',
    sponsorshipType: 'Cloud Credits + Developer Tools',
    sponsorshipCriteria:
      'Minimum registrations: 800+\nAt least one cloud-based project track\nOpportunity to host a technical workshop',
    technologies: ['AWS Lambda', 'AWS AI Services'],
    contactEmail: 'aws-startups@amazon.com',
    cashPrizeContribution: '$3000',
    apiCredits: '',
    cloudCredits: 'Up to $10,000 AWS credits',
    mentorshipSupport: true,
    judgingParticipation: true,
    workshopsOrTechTalks: true,
    swagOrMerchandise: false,
    pastHackathons: ['CloudHack 2025'],
    linkedinPage: 'https://www.linkedin.com/company/amazon-web-services/',
  },
  {
    id: 'gcp',
    companyName: 'Google Cloud',
    logoUrl: 'https://www.gstatic.com/devrel-devsite/prod/v7f66f4f95d44f4f4a95a5f7865f4f9df95f8a46f7f487570b6ff5480a219c2f6/cloud/images/cloud-logo.svg',
    industry: 'Cloud Platform',
    website: 'https://cloud.google.com',
    about: 'Google Cloud offers scalable compute, data, and AI services for modern applications.',
    sponsorshipType: 'Cloud Credits + APIs',
    sponsorshipCriteria:
      'Minimum registrations: 1000+\nGlobal or multi-college participation\nOpportunity for developer workshop',
    technologies: ['Google Cloud APIs', 'Firebase'],
    contactEmail: 'cloud-partnerships@google.com',
    cashPrizeContribution: '$4000',
    apiCredits: 'Vertex AI + Maps APIs',
    cloudCredits: 'Google Cloud startup credits',
    mentorshipSupport: true,
    judgingParticipation: true,
    workshopsOrTechTalks: true,
    swagOrMerchandise: true,
    pastHackathons: ['BuildWithAI 2025'],
    linkedinPage: 'https://www.linkedin.com/company/google-cloud/',
  },
];

let registeredSponsors = [];

function normalizeId(companyName) {
  return String(companyName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', async (_req, res) => {
  const sponsors = registeredSponsors.length > 0 ? registeredSponsors : defaultSponsors;
  res.json({ sponsors });
});

router.get('/:id', async (req, res) => {
  const sponsors = registeredSponsors.length > 0 ? registeredSponsors : defaultSponsors;
  const sponsor = sponsors.find((item) => item.id === req.params.id);

  if (!sponsor) {
    return res.status(404).json({ message: 'Sponsor not found' });
  }

  res.json(sponsor);
});

router.post('/register', async (req, res) => {
  const payload = req.body || {};
  if (!payload.companyName || !payload.contactEmail) {
    return res.status(400).json({ message: 'companyName and contactEmail are required' });
  }

  const id = normalizeId(payload.companyName);
  const sponsor = {
    id,
    companyName: payload.companyName,
    logoUrl: payload.logoUrl || '',
    industry: payload.industry || '',
    website: payload.website || '',
    about: payload.about || '',
    sponsorshipType: payload.sponsorshipType || '',
    sponsorshipCriteria: payload.sponsorshipCriteria || '',
    technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
    contactEmail: payload.contactEmail,
    cashPrizeContribution: payload.cashPrizeContribution || '',
    apiCredits: payload.apiCredits || '',
    cloudCredits: payload.cloudCredits || '',
    mentorshipSupport: Boolean(payload.mentorshipSupport),
    judgingParticipation: Boolean(payload.judgingParticipation),
    workshopsOrTechTalks: Boolean(payload.workshopsOrTechTalks),
    swagOrMerchandise: Boolean(payload.swagOrMerchandise),
    pastHackathons: Array.isArray(payload.pastHackathons) ? payload.pastHackathons : [],
    linkedinPage: payload.linkedinPage || '',
  };

  registeredSponsors = [sponsor, ...registeredSponsors.filter((item) => item.id !== id)];
  res.status(201).json({ message: 'Sponsor registered successfully', sponsor });
});

module.exports = router;
