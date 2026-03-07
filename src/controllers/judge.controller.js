const prisma = require('../config/prisma');


// =========================
// GET ASSIGNED TEAMS
// =========================
exports.getAssignedTeams = async (req, res) => {
  try {

    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id }
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    const assignments = await prisma.judgeAssignment.findMany({
      where: { judgeId: judge.id },
      include: {
        team: true
      }
    });

    const teams = assignments.map(a => ({
      teamId: a.team.id,
      teamName: a.team.name,
      projectTitle: a.team.projectTitle || "Project",
      repoUrl: a.team.repoUrl || "",
      demoUrl: a.team.demoUrl || "",
      category: a.team.category || "General"
    }));

    res.json(teams);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// =========================
// SUBMIT SCORE
// =========================
exports.submitScore = async (req, res) => {
  try {

    const { teamId, innovationScore, technicalScore, usabilityScore } = req.body;

    if (
      !teamId ||
      innovationScore == null ||
      technicalScore == null ||
      usabilityScore == null
    ) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id }
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    // Check assignment
    const assignment = await prisma.judgeAssignment.findFirst({
      where: {
        judgeId: judge.id,
        teamId: Number(teamId)
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    // Prevent duplicate scoring
    const existingScore = await prisma.score.findFirst({
      where: {
        judgeId: judge.id,
        teamId: Number(teamId)
      }
    });

    if (existingScore) {
      return res.status(400).json({ message: 'Score already submitted for this team' });
    }

    const finalScore =
      Number(innovationScore) +
      Number(technicalScore) +
      Number(usabilityScore);

    const score = await prisma.score.create({
      data: {
        judgeId: judge.id,
        teamId: Number(teamId),
        innovationScore: Number(innovationScore),
        technicalScore: Number(technicalScore),
        usabilityScore: Number(usabilityScore),
        finalScore
      }
    });

    res.status(201).json({
      message: 'Score submitted',
      score
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// =========================
// JUDGE LEADERBOARD
// =========================
exports.getLeaderboard = async (req, res) => {
  try {

    const teams = await prisma.team.findMany({
      include: {
        scores: true
      }
    });

    const leaderboard = teams.map(team => {

      const totalScore = team.scores.reduce(
        (sum, score) => sum + score.finalScore,
        0
      );

      return {
        teamName: team.name,
        totalScore
      };

    });

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    res.json(leaderboard);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};