const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const postWithRetry = async (path, payload, timeout = 20000, retries = 2) => {
  let lastError;
  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      console.log(`[ML] Request attempt ${attempt} -> ${path}`, payload);
      const res = await axios.post(`${ML_URL}${path}`, payload, { timeout });
      console.log(`[ML] Response from ${path}:`, res.data);
      return res.data;
    } catch (error) {
      lastError = error;
      const message = error?.response?.data || error.message;
      console.error(`[ML] Attempt ${attempt} failed for ${path}:`, message);
      if (attempt <= retries) {
        await delay(400 * attempt);
      }
    }
  }
  throw lastError;
};


// =========================
// GENERATE SUMMARY
// =========================
exports.generateSummary = async (repoLink) => {
  return postWithRetry("/generate-summary", {
    repoUrl: repoLink,
    repo_url: repoLink,
  }, 10000, 1);
};


// =========================
// CLASSIFY PROJECT
// =========================
exports.classifyProject = async (repoLink) => {
  return postWithRetry("/classify-project", {
    repoUrl: repoLink,
    repo_url: repoLink,
  }, 10000, 1);
};


// =========================
// ANALYZE TECH STACK
// =========================
exports.analyzeStack = async (repoLink) => {
  return postWithRetry("/analyze-project-stack", {
    repoUrl: repoLink,
    repo_url: repoLink,
  }, 10000, 1);
};

// =========================
// FULL REPO ANALYSIS
// =========================
exports.analyzeRepository = async (repoLink) => {
  return postWithRetry("/analyze", {
    repoUrl: repoLink,
    repo_url: repoLink,
  }, 25000, 2);
};
