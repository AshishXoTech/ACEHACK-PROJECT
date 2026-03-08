const prisma = require('../config/prisma');

const sumScore = (scores) =>
  scores.reduce((sum, score) => sum + Number(score.totalScore || 0), 0);

const addRanks = (rows) => {
  let rank = 1;
  return rows.map((row, index) => {
    if (index > 0 && row.totalScore < rows[index - 1].totalScore) {
      rank = index + 1;
    }
    return { ...row, rank };
  });
};

exports.recalculateLeaderboard = async (eventId) => {
  const eventIdNum = Number(eventId);

  const submissions = await prisma.submission.findMany({
    where: { team: { eventId: eventIdNum } },
    include: {
      team: true,
      scores: true,
    },
  });

  const rankedRows = addRanks(
    submissions
      .map((submission) => ({
        eventId: eventIdNum,
        submissionId: submission.id,
        teamId: submission.teamId,
        totalScore: sumScore(submission.scores),
      }))
      .sort((a, b) => b.totalScore - a.totalScore),
  );

  await prisma.$transaction([
    prisma.leaderboardEntry.deleteMany({ where: { eventId: eventIdNum } }),
    ...(rankedRows.length
      ? [
          prisma.leaderboardEntry.createMany({
            data: rankedRows.map((row) => ({
              eventId: row.eventId,
              submissionId: row.submissionId,
              teamId: row.teamId,
              totalScore: row.totalScore,
              rank: row.rank,
            })),
          }),
        ]
      : []),
  ]);

  return rankedRows;
};

exports.getLeaderboardByEvent = async (eventId) => {
  const eventIdNum = Number(eventId);

  return prisma.leaderboardEntry.findMany({
    where: { eventId: eventIdNum },
    include: {
      team: true,
      submission: true,
    },
    orderBy: [{ rank: 'asc' }, { totalScore: 'desc' }],
  });
};
