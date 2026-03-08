const axios = require('axios');
const mlService = require('./ml.service');

const GITHUB_API = 'https://api.github.com';

const allowedCategories = [
  'AI / ML',
  'Web Application',
  'Mobile App',
  'Blockchain',
  'Developer Tools',
  'IoT',
  'Cybersecurity',
  'Other',
];

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'devora-repo-analyzer',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function parseRepoUrl(repoUrl) {
  if (typeof repoUrl !== 'string') return null;
  const match = repoUrl.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/\s]+?)(?:\.git)?(?:\/.*)?$/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function decodeReadme(content, encoding) {
  if (!content || encoding !== 'base64') return '';
  try {
    return Buffer.from(content, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function normalizeCategory(category, readme = '') {
  if (typeof category === 'string') {
    const normalized = category.trim().toLowerCase();
    const mapped = allowedCategories.find((item) => item.toLowerCase() === normalized);
    if (mapped) return mapped;
    if (normalized.includes('ai') || normalized.includes('ml')) return 'AI / ML';
    if (normalized.includes('web')) return 'Web Application';
    if (normalized.includes('mobile')) return 'Mobile App';
    if (normalized.includes('blockchain')) return 'Blockchain';
    if (normalized.includes('tool')) return 'Developer Tools';
    if (normalized.includes('iot')) return 'IoT';
    if (normalized.includes('security')) return 'Cybersecurity';
  }

  const readmeLower = readme.toLowerCase();
  if (readmeLower.includes('tensorflow') || readmeLower.includes('pytorch') || readmeLower.includes('machine learning')) return 'AI / ML';
  if (readmeLower.includes('react') || readmeLower.includes('next.js') || readmeLower.includes('web app')) return 'Web Application';
  if (readmeLower.includes('android') || readmeLower.includes('ios') || readmeLower.includes('flutter')) return 'Mobile App';
  return 'Other';
}

function fallbackSummary(repoMeta = {}, readme = '') {
  const description = typeof repoMeta?.description === 'string' ? repoMeta.description.trim() : '';
  if (description) return description;
  const normalized = (readme || '').replace(/[#>*`]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return 'Repository analysis unavailable.';
  return normalized.slice(0, 300);
}

function deriveDevelopmentPattern(commits = []) {
  if (!commits.length) return 'No recent commit activity detected.';
  if (commits.length < 4) return 'Low-frequency updates in recent commits.';

  const dates = commits
    .map((c) => new Date(c?.commit?.author?.date || c?.commit?.committer?.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!dates.length) return 'Commit dates unavailable for pattern analysis.';

  const spanDays = Math.max(1, (dates[dates.length - 1].getTime() - dates[0].getTime()) / 86400000);
  const density = commits.length / spanDays;

  if (density >= 1.2) return 'Consistent commit activity with regular development updates.';
  if (density >= 0.5) return 'Moderate development cadence with periodic commits.';
  return 'Burst-based development with longer inactive gaps between commits.';
}

function deriveMajorFocus(commits = [], readme = '') {
  const corpus = `${commits.map((c) => c?.commit?.message || '').join(' ')} ${readme}`.toLowerCase();
  if (!corpus.trim()) return 'General repository improvements.';

  const focusRules = [
    { key: 'Frontend UI improvements', hits: ['ui', 'frontend', 'react', 'layout', 'css', 'tailwind'] },
    { key: 'Backend/API implementation', hits: ['api', 'backend', 'server', 'route', 'endpoint', 'database'] },
    { key: 'Model/algorithm iteration', hits: ['model', 'train', 'inference', 'ml', 'ai', 'classification'] },
    { key: 'Testing and bug fixes', hits: ['fix', 'bug', 'test', 'spec', 'error'] },
    { key: 'Documentation and setup', hits: ['readme', 'doc', 'setup', 'install', 'config'] },
  ];

  let best = { key: 'General feature development', score: 0 };
  for (const rule of focusRules) {
    const score = rule.hits.reduce((acc, hit) => acc + (corpus.includes(hit) ? 1 : 0), 0);
    if (score > best.score) best = { key: rule.key, score };
  }

  return best.key;
}

function deriveTopContributor(commits = []) {
  if (!commits.length) return 'Unavailable';

  const counts = new Map();
  for (const commit of commits) {
    const login = commit?.author?.login;
    const fallback = commit?.commit?.author?.name;
    const key = login || fallback || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  let top = 'Unavailable';
  let max = -1;
  for (const [key, value] of counts.entries()) {
    if (value > max) {
      top = key;
      max = value;
    }
  }
  return top;
}

function uniqueTechStack(aiTechStack = [], languages = {}) {
  const merged = new Set();
  for (const item of aiTechStack || []) {
    if (item) merged.add(String(item).trim());
  }
  for (const lang of Object.keys(languages || {})) {
    if (lang) merged.add(lang.trim());
  }
  return Array.from(merged).filter(Boolean);
}

function mapGithubError(error) {
  const status = error?.response?.status;
  if (status === 404) {
    return { status: 404, message: 'Repository analysis unavailable: repository not found or private.' };
  }
  if (status === 403) {
    const remaining = error?.response?.headers?.['x-ratelimit-remaining'];
    if (remaining === '0') {
      return { status: 429, message: 'Repository analysis unavailable: GitHub API rate limit exceeded.' };
    }
    return { status: 403, message: 'Repository analysis unavailable: access denied by GitHub.' };
  }
  return { status: 502, message: 'Repository analysis unavailable due to GitHub API error.' };
}

async function fetchGithubContext(repoUrl) {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return { error: { status: 400, message: 'Repository analysis unavailable: invalid GitHub repository URL.' } };
  }

  const { owner, repo } = parsed;
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;
  const headers = githubHeaders();

  try {
    const [repoMetaRes, languagesRes, commitsRes, readmeRes] = await Promise.all([
      axios.get(baseUrl, { headers, timeout: 12000 }),
      axios.get(`${baseUrl}/languages`, { headers, timeout: 12000 }),
      axios.get(`${baseUrl}/commits`, { headers, params: { per_page: 20 }, timeout: 12000 }),
      axios.get(`${baseUrl}/readme`, { headers, timeout: 12000 }).catch((readmeErr) => {
        if (readmeErr?.response?.status === 404) {
          return { data: { content: '', encoding: '' } };
        }
        throw readmeErr;
      }),
    ]);

    return {
      parsed,
      repoMeta: repoMetaRes.data || {},
      languages: languagesRes.data || {},
      commits: Array.isArray(commitsRes.data) ? commitsRes.data : [],
      readme: decodeReadme(readmeRes?.data?.content, readmeRes?.data?.encoding),
    };
  } catch (error) {
    return { error: mapGithubError(error) };
  }
}

function buildCachedResponse(teamId, submission) {
  const techStack = submission.techStack
    ? submission.techStack.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    teamId: String(teamId),
    projectSummary: submission.summary || 'Repository analysis unavailable.',
    projectCategory: normalizeCategory(submission.classification || 'Other'),
    techStack,
    commitInsights: {
      totalCommits: submission.commitTotal || 0,
      topContributor: 'Unavailable (cached)',
      developmentPattern: 'Using cached analysis from previous run.',
      majorFocus: 'General feature development',
    },
    commitFrequency: {
      last7Days: submission.commitLast7Days || 0,
      last30Days: submission.commitLast30Days || 0,
    },
    generatedAt: submission.analyzedAt ? submission.analyzedAt.toISOString() : null,
    cached: true,
  };
}

async function generateRepoAnalysis(repoUrl, teamId) {
  const github = await fetchGithubContext(repoUrl);
  if (github.error) return { error: github.error };

  console.log('[Repo Analysis] Repo URL received:', repoUrl);
  console.log('[Repo Analysis] README fetched:', Boolean(github.readme), 'length:', github.readme.length);

  let ai = null;
  try {
    ai = await mlService.analyzeRepository(repoUrl);
    if (ai?.error) ai = null;
  } catch (err) {
    ai = null;
  }

  const aiTechStack = Array.isArray(ai.techStack)
    ? ai.techStack
    : Array.isArray(ai.tech_stack)
      ? ai.tech_stack
      : [];

  const commitStats = ai.commitStats || ai.commit_frequency || {
    total: github.commits.length,
    last7Days: 0,
    last30Days: 0,
  };

  const result = {
    teamId: String(teamId),
    projectSummary: (ai && ai.summary) || fallbackSummary(github.repoMeta, github.readme),
    projectCategory: normalizeCategory((ai && ai.category) || 'Other', github.readme),
    techStack: uniqueTechStack(aiTechStack, github.languages),
    commitInsights: {
      totalCommits: Number.isFinite(Number(commitStats.total)) ? Number(commitStats.total) : github.commits.length,
      topContributor: deriveTopContributor(github.commits),
      developmentPattern: deriveDevelopmentPattern(github.commits),
      majorFocus: deriveMajorFocus(github.commits, github.readme),
    },
    commitFrequency: {
      last7Days: Number.isFinite(Number(commitStats.last7Days)) ? Number(commitStats.last7Days) : 0,
      last30Days: Number.isFinite(Number(commitStats.last30Days)) ? Number(commitStats.last30Days) : 0,
    },
    generatedAt: new Date().toISOString(),
    cached: false,
    raw: {
      summary: (ai && ai.summary) || fallbackSummary(github.repoMeta, github.readme),
      category: (ai && ai.category) || normalizeCategory('Other', github.readme),
      techStack: uniqueTechStack(aiTechStack, github.languages),
      commitStats: {
        total: Number.isFinite(Number(commitStats.total)) ? Number(commitStats.total) : 0,
        last7Days: Number.isFinite(Number(commitStats.last7Days)) ? Number(commitStats.last7Days) : 0,
        last30Days: Number.isFinite(Number(commitStats.last30Days)) ? Number(commitStats.last30Days) : 0,
      },
    },
  };

  console.log('[Repo Analysis] Final JSON returned:', result);
  return { data: result };
}

module.exports = {
  parseRepoUrl,
  buildCachedResponse,
  generateRepoAnalysis,
};
