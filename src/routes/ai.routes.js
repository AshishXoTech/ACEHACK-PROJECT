const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const {
  buildCachedResponse,
  generateRepoAnalysis,
} = require('../services/repo-analysis.service');

const router = express.Router();

// GET /api/ai/repo-analysis/:teamId
router.get(
  '/repo-analysis/:teamId',
  authMiddleware,
  roleMiddleware('judge', 'organizer'),
  async (req, res) => {
    try {
      const teamIdNum = Number(req.params.teamId);
      if (Number.isNaN(teamIdNum)) {
        return res.status(400).json({ message: 'Invalid teamId' });
      }

      const team = await prisma.team.findUnique({
        where: { id: teamIdNum },
        include: {
          event: { select: { organizerId: true } },
          submission: true,
        },
      });

      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Access control
      if (req.user.role === 'judge') {
        const judge = await prisma.judge.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });

        if (!judge) {
          return res.status(404).json({ message: 'Judge profile not found' });
        }

        const assignment = await prisma.judgeAssignment.findFirst({
          where: {
            judgeId: judge.id,
            teamId: teamIdNum,
          },
          select: { id: true },
        });

        if (!assignment) {
          return res.status(403).json({ message: 'Access denied for this team' });
        }
      } else if (req.user.role === 'organizer' && team.event.organizerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied for this event' });
      }

      if (!team.submission || !team.submission.repoLink) {
        return res.status(404).json({ message: 'Repository analysis unavailable: submission not found.' });
      }

      const hasCachedAnalysis =
        Boolean(team.submission.analyzedAt) &&
        Boolean(team.submission.summary) &&
        Boolean(team.submission.classification);

      if (hasCachedAnalysis) {
        return res.json(buildCachedResponse(team.id, team.submission));
      }

      const generated = await generateRepoAnalysis(team.submission.repoLink, team.id);
      if (generated.error) {
        return res.status(generated.error.status || 502).json({ message: generated.error.message });
      }

      const normalized = generated.data.raw;
      const updatedSubmission = await prisma.submission.update({
        where: { id: team.submission.id },
        data: {
          summary: normalized.summary || team.submission.summary || '',
          classification: normalized.category || team.submission.classification || 'Other',
          techStack: Array.isArray(normalized.techStack) ? normalized.techStack.join(', ') : team.submission.techStack,
          commitTotal: normalized.commitStats?.total ?? team.submission.commitTotal,
          commitLast7Days: normalized.commitStats?.last7Days ?? team.submission.commitLast7Days,
          commitLast30Days: normalized.commitStats?.last30Days ?? team.submission.commitLast30Days,
          analyzedAt: new Date(),
        },
      });

      return res.json({
        ...generated.data,
        generatedAt: updatedSubmission.analyzedAt?.toISOString() || generated.data.generatedAt,
      });
    } catch (error) {
      console.error('[AI Repo Analysis] Failed:', error?.message || error);
      return res.status(500).json({ message: 'Repository analysis unavailable' });
    }
  },
);

module.exports = router;

