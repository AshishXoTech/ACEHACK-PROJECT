const prisma = require('../config/prisma');
const leaderboardService = require('../services/leaderboard.service');

const deriveProjectName = (repoUrl, fallback) => {
  if (!repoUrl || typeof repoUrl !== 'string') return fallback || 'Untitled Project';
  const cleaned = repoUrl.replace(/\/+$/, '').replace(/\.git$/i, '');
  const parts = cleaned.split('/');
  const repoName = parts[parts.length - 1];
  if (!repoName) return fallback || 'Untitled Project';
  return repoName.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || fallback || 'Untitled Project';
};


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
        team: {
          include: {
            event: true,
            submission: {
              include: {
                scores: {
                  where: { judgeId: judge.id },
                  take: 1,
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        },
      },
    });

    const teams = assignments.map(a => ({
      teamId: String(a.team.id),
      teamName: a.team.name,
      eventId: String(a.team.eventId),
      eventName: a.team.event?.name || 'Event',
      submissionId: a.team.submission ? String(a.team.submission.id) : null,
      projectName: deriveProjectName(a.team.submission?.repoLink, a.team.name),
      repo: a.team.submission?.repoLink || null,
      repoUrl: a.team.submission?.repoLink || null,
      demoUrl: a.team.submission?.profileLink || null,
      demoVideo: a.team.submission?.profileLink || null,
      description: a.team.submission?.summary || '',
      readme: a.team.submission?.summary || '',
      summary: a.team.submission?.summary || '',
      readmeSummary: a.team.submission?.summary || '',
      category: a.team.submission?.classification || '',
      techStack: a.team.submission?.techStack
        ? a.team.submission.techStack.split(',').map((s) => s.trim())
        : [],
      commitStats: {
        total: a.team.submission?.commitTotal || 0,
        last7Days: a.team.submission?.commitLast7Days || 0,
        last30Days: a.team.submission?.commitLast30Days || 0,
      },
      evaluated: Boolean(a.team.submission?.scores?.length),
      score: a.team.submission?.scores?.[0]?.totalScore ?? null,
    }));

    res.json({ teams });

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
    const {
      submissionId: rawSubmissionId,
      teamId: rawTeamId,
      innovation,
      innovationScore,
      technicalComplexity,
      technical,
      technicalScore,
      impact,
      impactScore,
      design,
      presentation,
      presentationScore,
      comments,
    } = req.body;

    const resolvedInnovation = innovation ?? innovationScore;
    const resolvedTechnical = technical ?? technicalComplexity ?? technicalScore;
    const resolvedImpact = impact ?? impactScore;
    const resolvedPresentation = design ?? presentation ?? presentationScore;

    if (
      (!rawSubmissionId && !rawTeamId) ||
      resolvedInnovation == null ||
      resolvedTechnical == null ||
      resolvedImpact == null ||
      resolvedPresentation == null
    ) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const criteria = [
      { key: 'innovation', value: Number(resolvedInnovation) },
      { key: 'technicalScore', value: Number(resolvedTechnical) },
      { key: 'impactScore', value: Number(resolvedImpact) },
      { key: 'presentationScore', value: Number(resolvedPresentation) },
    ];

    const invalidCriterion = criteria.find(
      (c) => Number.isNaN(c.value) || c.value < 0 || c.value > 10,
    );

    if (invalidCriterion) {
      return res.status(400).json({
        message: `${invalidCriterion.key} must be a number between 0 and 10`,
      });
    }

    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id }
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    let submission = null;
    if (rawSubmissionId) {
      submission = await prisma.submission.findUnique({
        where: { id: Number(rawSubmissionId) },
        include: { team: true },
      });
    } else {
      submission = await prisma.submission.findUnique({
        where: { teamId: Number(rawTeamId) },
        include: { team: true },
      });
    }

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check assignment
    const assignment = await prisma.judgeAssignment.findFirst({
      where: {
        judgeId: judge.id,
        teamId: submission.teamId
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    // Prevent duplicate scoring
    const existingScore = await prisma.score.findFirst({
      where: {
        judgeId: judge.id,
        submissionId: submission.id,
      }
    });

    if (existingScore) {
      return res.status(400).json({ message: 'Score already submitted for this team' });
    }

    const totalScore =
      Number(resolvedInnovation) +
      Number(resolvedTechnical) +
      Number(resolvedImpact) +
      Number(resolvedPresentation);

    const commentText = typeof comments === 'string' ? comments.trim() : null;

    let score;
    try {
      score = await prisma.score.create({
        data: {
          judgeId: judge.id,
          submissionId: submission.id,
          teamId: submission.teamId,
          innovation: Number(resolvedInnovation),
          technicalComplexity: Number(resolvedTechnical),
          design: Number(resolvedPresentation),
          impact: Number(resolvedImpact),
          comments: commentText,
          totalScore,
        }
      });
    } catch (createError) {
      const message = String(createError?.message || '');
      if (!message.includes('Unknown arg `comments`')) {
        throw createError;
      }

      score = await prisma.score.create({
        data: {
          judgeId: judge.id,
          submissionId: submission.id,
          teamId: submission.teamId,
          innovation: Number(resolvedInnovation),
          technicalComplexity: Number(resolvedTechnical),
          design: Number(resolvedPresentation),
          impact: Number(resolvedImpact),
          totalScore,
        }
      });
    }

    await leaderboardService.recalculateLeaderboard(submission.team.eventId);

    res.status(201).json({
      message: 'Score submitted',
      score: {
        id: String(score.id),
        submissionId: String(score.submissionId),
        teamId: String(score.teamId),
        judgeId: String(score.judgeId),
        innovation: score.innovation,
        technical: score.technicalComplexity,
        technicalComplexity: score.technicalComplexity,
        presentation: score.design,
        design: score.design,
        impact: score.impact,
        comments: score.comments ?? commentText,
        totalScore: score.totalScore,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// GET SUBMISSION BY TEAM
// =========================
exports.getSubmissionByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const teamIdNum = Number(teamId);

    if (Number.isNaN(teamIdNum)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    const judge = await prisma.judge.findUnique({
      where: { userId: req.user.id },
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    const assignment = await prisma.judgeAssignment.findFirst({
      where: { judgeId: judge.id, teamId: teamIdNum },
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamIdNum },
      include: {
        registrations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        submission: true,
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
      projectName: deriveProjectName(team.submission.repoLink, team.name),
      members: team.registrations.map((registration) => ({
        id: String(registration.user.id),
        name: registration.user.name,
        email: registration.user.email,
      })),
      repositoryLink: team.submission.repoLink,
      demoVideo: team.submission.profileLink || '',
      description: team.submission.summary || '',
      readmePreview: team.submission.summary || 'README preview unavailable.',
      submissionDescription: team.submission.summary || '',
      category: team.submission.classification || '',
      techStack: team.submission.techStack
        ? team.submission.techStack.split(',').map((s) => s.trim())
        : [],
      commitStats: {
        total: team.submission.commitTotal || 0,
        last7Days: team.submission.commitLast7Days || 0,
        last30Days: team.submission.commitLast30Days || 0,
      },
      submissionId: String(team.submission.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// ORGANIZER: GET ASSIGNMENT DATA
// =========================
exports.getAssignmentsForEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied for this event' });
    }

    const teams = await prisma.team.findMany({
      where: { eventId },
      include: {
        assignments: {
          include: {
            judge: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
          take: 1,
          orderBy: { id: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    const judges = await prisma.judge.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { id: 'asc' },
    });

    const assignments = teams.map((team) => {
      const assignment = team.assignments[0] || null;
      return {
        teamId: String(team.id),
        teamName: team.name,
        judgeId: assignment ? String(assignment.judge.user.id) : null,
        judgeName: assignment ? assignment.judge.user.name : null,
      };
    });

    res.json({
      assignments,
      judges: judges.map((judge) => ({
        id: String(judge.user.id),
        name: judge.user.name,
        email: judge.user.email,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// ORGANIZER: ASSIGN JUDGE TO TEAM
// =========================
exports.assignJudgeToTeam = async (req, res) => {
  try {
    const { eventId, teamId, judgeId } = req.body;

    if (!eventId || !teamId || !judgeId) {
      return res.status(400).json({ message: 'eventId, teamId and judgeId are required' });
    }

    const eventIdNum = Number(eventId);
    const teamIdNum = Number(teamId);
    const judgeUserId = Number(judgeId);

    if (Number.isNaN(eventIdNum) || Number.isNaN(teamIdNum) || Number.isNaN(judgeUserId)) {
      return res.status(400).json({ message: 'Invalid numeric ids in payload' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
      select: { organizerId: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied for this event' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamIdNum },
      select: { id: true, name: true, eventId: true },
    });

    if (!team || team.eventId !== eventIdNum) {
      return res.status(404).json({ message: 'Team not found in selected event' });
    }

    const judge = await prisma.judge.findFirst({
      where: { userId: judgeUserId },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge profile not found' });
    }

    const existing = await prisma.judgeAssignment.findFirst({
      where: { judgeId: judge.id, teamId: team.id },
    });

    if (existing) {
      return res.json({
        id: String(existing.id),
        teamId: String(team.id),
        teamName: team.name,
        judgeId: String(judge.user.id),
        judgeName: judge.user.name,
        evaluated: false,
      });
    }

    const assignment = await prisma.judgeAssignment.create({
      data: {
        judgeId: judge.id,
        teamId: team.id,
      },
    });

    res.status(201).json({
      id: String(assignment.id),
      teamId: String(team.id),
      teamName: team.name,
      judgeId: String(judge.user.id),
      judgeName: judge.user.name,
      evaluated: false,
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
    const leaderboard = await prisma.leaderboardEntry.findMany({
      include: { team: true },
      orderBy: [{ rank: 'asc' }, { totalScore: 'desc' }],
    });

    res.json(
      leaderboard.map((entry) => ({
        rank: entry.rank,
        teamName: entry.team.name,
        totalScore: entry.totalScore,
      })),
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
