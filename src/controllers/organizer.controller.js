const prisma = require('../config/prisma');
const certificateService = require('../services/certificate.service');



// =========================
// GENERATE CERTIFICATES FOR TOP N
// =========================
exports.generateCertificates = async (req, res) => {
  try {
    const { eventId, topN } = req.body;

    if (!eventId || !topN) {
      return res.status(400).json({ message: 'eventId and topN required' });
    }

    // Fetch leaderboard
    const teams = await prisma.team.findMany({
      where: { eventId: Number(eventId) },
      include: {
        scores: true,
        registrations: {
          include: {
            user: true
          }
        }
      }
    });

    const leaderboard = teams.map(team => {
      const totalScore = team.scores.reduce(
        (sum, score) => sum + score.totalScore,
        0
      );

      return {
        team,
        totalScore
      };
    });

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    const winners = leaderboard.slice(0, Number(topN));

    const generatedCertificates = [];

    for (const entry of winners) {
      const team = entry.team;

      for (const registration of team.registrations) {
        const user = registration.user;

        const fileName = await certificateService.generateCertificatePDF(
          user.name,
          `Event ${eventId}`
        );

        const certificate = await prisma.certificate.create({
          data: {
            userId: user.id,
            eventId: Number(eventId),
            certificateUrl: `/certificates/${fileName}`
          }
        });

        generatedCertificates.push(certificate);
      }
    }

    res.json({
      message: 'Certificates generated',
      generatedCertificates
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// CREATE EVENT
// =========================
exports.createEvent = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        organizerId: req.user.id
      }
    });

    res.status(201).json(event);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// CREATE JUDGE PROFILE
// =========================
exports.createJudge = async (req, res) => {
  try {
    const { userId, expertise } = req.body;

    if (!userId || !expertise) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user || user.role !== 'judge') {
      return res.status(400).json({ message: 'User is not a judge' });
    }

    const existingJudge = await prisma.judge.findUnique({
      where: { userId: Number(userId) }
    });

    if (existingJudge) {
      return res.status(400).json({ message: 'Judge already exists' });
    }

    const judge = await prisma.judge.create({
      data: {
        userId: Number(userId),
        expertise
      }
    });

    res.status(201).json(judge);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// ASSIGN JUDGE TO TEAM
// =========================
exports.assignJudge = async (req, res) => {
  try {
    const { judgeId, teamId } = req.body;

    if (!judgeId || !teamId) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const judge = await prisma.judge.findUnique({
      where: { id: Number(judgeId) }
    });

    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }

    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const existingAssignment = await prisma.judgeAssignment.findFirst({
      where: {
        judgeId: Number(judgeId),
        teamId: Number(teamId)
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'Judge already assigned' });
    }

    const assignment = await prisma.judgeAssignment.create({
      data: {
        judgeId: Number(judgeId),
        teamId: Number(teamId)
      }
    });

    res.status(201).json(assignment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// VIEW EVENT REGISTRATIONS
// =========================
exports.viewRegistrations = async (req, res) => {
  try {
    // Get all events organized by the current user
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.id },
      select: { id: true }
    });

    const eventIds = events.map(event => event.id);

    // Get all teams from all events organized by this user
    const teams = await prisma.team.findMany({
      where: {
        eventId: { in: eventIds }
      },
      include: {
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        submission: true,
        event: {
          select: { id: true, name: true }
        }
      }
    });

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => ({
      id: team.id,
      teamName: team.name,
      members: team.registrations.map(reg => reg.user.name),
      status: team.status,
      track: team.track,
      eventName: team.event.name,
      eventId: team.event.id
    }));

    res.json(formattedTeams);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// GENERATE LEADERBOARD
// =========================
exports.generateLeaderboard = async (req, res) => {
  try {
    const { eventId } = req.params;

    const teams = await prisma.team.findMany({
      where: { eventId: Number(eventId) },
      include: {
        scores: true
      }
    });

    const leaderboard = teams.map(team => {
      const totalScore = team.scores.reduce(
        (sum, score) => sum + score.totalScore,
        0
      );

      return {
        teamId: team.id,
        teamName: team.name,
        totalScore
      };
    });

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    // Add ranking with tie handling
    let rank = 1;

    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].totalScore < leaderboard[i - 1].totalScore) {
        rank = i + 1;
      }

      leaderboard[i].rank = rank;
    }

    res.json(leaderboard);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
