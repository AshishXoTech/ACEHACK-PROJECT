const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL;


// =========================
// GENERATE SUMMARY
// =========================
exports.generateSummary = async (repoLink) => {

  const res = await axios.post(
    `${ML_URL}/generate-summary`,
    {
      repo_url: repoLink
    },
    { timeout: 10000 }
  );

  return res.data;
};


// =========================
// CLASSIFY PROJECT
// =========================
exports.classifyProject = async (repoLink) => {

  const res = await axios.post(
    `${ML_URL}/classify-project`,
    {
      repo_url: repoLink
    },
    { timeout: 10000 }
  );

  return res.data;
};


// =========================
// ANALYZE TECH STACK
// =========================
exports.analyzeStack = async (repoLink) => {

  const res = await axios.post(
    `${ML_URL}/analyze-project-stack`,
    {
      repo_url: repoLink
    },
    { timeout: 10000 }
  );

  return res.data;
};