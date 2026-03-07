const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

function detectCategory(text) {
  const normalized = text.toLowerCase();
  const categories = [
    { name: 'Healthcare AI', keywords: ['health', 'medical', 'diagnosis', 'hospital'] },
    { name: 'Fintech', keywords: ['finance', 'payment', 'bank', 'loan'] },
    { name: 'EdTech', keywords: ['education', 'student', 'learning', 'course'] },
    { name: 'Sustainability', keywords: ['climate', 'carbon', 'green', 'sustainability'] },
    { name: 'Developer Tools', keywords: ['developer', 'cli', 'devops', 'automation'] },
  ];

  const match = categories.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match ? match.name : 'General Hackathon Project';
}

function detectTechStack(packageJson, requirements, readme) {
  const stack = new Set();
  const lowerReadme = (readme || '').toLowerCase();

  if (packageJson) {
    try {
      const parsed = typeof packageJson === 'string' ? JSON.parse(packageJson) : packageJson;
      const deps = {
        ...(parsed.dependencies || {}),
        ...(parsed.devDependencies || {}),
      };
      Object.keys(deps).forEach((dep) => {
        if (dep.includes('react')) stack.add('React');
        if (dep.includes('next')) stack.add('Next.js');
        if (dep.includes('express')) stack.add('Express');
        if (dep.includes('typescript')) stack.add('TypeScript');
        if (dep.includes('tensorflow')) stack.add('TensorFlow');
      });
    } catch (_) {
      // Ignore parse errors and continue with other signals.
    }
  }

  const reqLines = (requirements || '')
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
  reqLines.forEach((line) => {
    if (line.includes('django')) stack.add('Django');
    if (line.includes('flask')) stack.add('Flask');
    if (line.includes('fastapi')) stack.add('FastAPI');
    if (line.includes('tensorflow')) stack.add('TensorFlow');
    if (line.includes('torch')) stack.add('PyTorch');
  });

  if (lowerReadme.includes('node')) stack.add('Node.js');
  if (lowerReadme.includes('python')) stack.add('Python');
  if (lowerReadme.includes('mongodb')) stack.add('MongoDB');
  if (lowerReadme.includes('postgres')) stack.add('PostgreSQL');

  return Array.from(stack);
}

router.post('/analyze-project', authMiddleware, async (req, res) => {
  try {
    const { repoUrl, readme, packageJson, requirements, commitHistory } = req.body || {};

    const readmeText = String(readme || '').trim();
    const repo = String(repoUrl || '').trim();
    const mergedText = `${repo}\n${readmeText}`;

    const summary = readmeText
      ? readmeText.slice(0, 260)
      : `Project repository ${repo || '(not provided)'}. README summary not available.`;
    const category = detectCategory(mergedText);
    const techStack = detectTechStack(packageJson, requirements, readmeText);

    const commits = Array.isArray(commitHistory) ? commitHistory.length : 0;
    const commitFrequency = commits > 0 ? `${commits} commits in provided history` : 'Commit history not provided';

    res.json({
      summary,
      category,
      techStack,
      commitFrequency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI analysis failed' });
  }
});

module.exports = router;
