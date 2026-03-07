const prisma = require('../config/prisma');

async function getJudgeByUserId(userId) {
  return prisma.judge.findUnique({
    where: { userId },
  });
}

exports.getAssignedTeams = async (req, res) => {
  try {
    const judge = await getJudgeByUserId(req.user.id);
    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    const assignments = await prisma.judgeAssignment.findMany({
      where: { judgeId: judge.id },
      include: {
        team: {
          include: {
            event: true,
            submission: true,
            registrations: {
              include: { user: { select: { name: true } } },
            },
            scores: {
              where: { judgeId: judge.id },
              select: { finalScore: true },
            },
          },
        },
      },
    });

    const teams = assignments.map((assignment) => {
      const team = assignment.team;
      const judgeScore = team.scores[0]?.finalScore ?? null;
      return {
        teamId: String(team.id),
        teamName: team.name,
        eventId: String(team.eventId),
        eventName: team.event.name,
        repoUrl: team.submission?.repoLink || '',
        readmeSummary: team.submission?.summary || '',
        // Compatibility aliases for existing consumers.
        repo: team.submission?.repoLink || '',
        summary: team.submission?.summary || '',
        members: team.registrations.map((r) => r.user.name),
        submissionId: team.submission ? String(team.submission.id) : null,
        score: judgeScore,
        evaluated: judgeScore !== null,
      };
    });

    res.json({ teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissionByTeam = async (req, res) => {
  try {
    const judge = await getJudgeByUserId(req.user.id);
    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    const teamId = Number(req.params.teamId);
    if (Number.isNaN(teamId)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    const assignment = await prisma.judgeAssignment.findFirst({
      where: { judgeId: judge.id, teamId },
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: true,
        submission: true,
        registrations: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.submission) {
      return res.status(404).json({ message: 'Submission not found for this team' });
    }

    res.json({
      teamId: String(team.id),
      teamName: team.name,
      eventId: String(team.eventId),
      eventName: team.event.name,
      members: team.registrations.map((r) => ({
        id: String(r.user.id),
        name: r.user.name,
        email: r.user.email,
      })),
      submissionId: String(team.submission.id),
      repo: team.submission.repoLink,
      demo: team.submission.profileLink || '',
      readme: team.submission.summary || '',
      description: team.submission.summary || '',
      status: team.submission.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const judge = await getJudgeByUserId(req.user.id);
    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    const {
      teamId,
      innovation,
      technical,
      impact,
      presentation,
      comments,
    } = req.body;

    if (
      !teamId ||
      innovation == null ||
      technical == null ||
      impact == null ||
      presentation == null
    ) {
      return res.status(400).json({ message: 'teamId and all score fields are required' });
    }

    const teamIdNum = Number(teamId);
    if (Number.isNaN(teamIdNum)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    const assignment = await prisma.judgeAssignment.findFirst({
      where: { judgeId: judge.id, teamId: teamIdNum },
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    const innovationScore = Number(innovation);
    const technicalScore = Number(technical);
    const impactScore = Number(impact);
    const presentationScore = Number(presentation);
    const usabilityScore = (impactScore + presentationScore) / 2;
    const totalScore = innovationScore + technicalScore + impactScore + presentationScore;

    const existing = await prisma.score.findFirst({
      where: { judgeId: judge.id, teamId: teamIdNum },
    });

    const score = existing
      ? await prisma.score.update({
          where: { id: existing.id },
          data: {
            innovationScore,
            technicalScore,
            usabilityScore,
            finalScore: totalScore,
          },
        })
      : await prisma.score.create({
          data: {
            judgeId: judge.id,
            teamId: teamIdNum,
            innovationScore,
            technicalScore,
            usabilityScore,
            finalScore: totalScore,
          },
        });

    res.status(201).json({
      message: existing ? 'Score updated' : 'Score submitted',
      teamId: String(teamIdNum),
      totalScore,
      comments: comments || '',
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const eventId = req.query.eventId ? Number(req.query.eventId) : null;
    const teams = await prisma.team.findMany({
      where: eventId ? { eventId } : undefined,
      include: {
        scores: true,
      },
    });

    const leaderboard = teams
      .map((team) => ({
        teamId: String(team.id),
        teamName: team.name,
        totalScore: team.scores.reduce((sum, score) => sum + score.finalScore, 0),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    res.json({ entries: leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
