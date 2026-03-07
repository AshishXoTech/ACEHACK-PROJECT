const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/submissions
 * Submit a project
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { eventId, teamId, repoUrl, summary, demoUrl } = req.body;

        if (!teamId || !repoUrl) {
            return res.status(400).json({ message: 'teamId and repoUrl are required' });
        }

        const team = await prisma.team.findUnique({ where: { id: Number(teamId) } });
        if (!team) return res.status(404).json({ message: 'Team not found' });

        const existing = await prisma.submission.findUnique({ where: { teamId: Number(teamId) } });

        let submission;
        if (existing) {
            submission = await prisma.submission.update({
                where: { teamId: Number(teamId) },
                data: {
                    repoLink: repoUrl,
                    profileLink: demoUrl || '',
                    summary: summary || '',
                    status: 'submitted'
                }
            });
        } else {
            submission = await prisma.submission.create({
                data: {
                    team: { connect: { id: Number(teamId) } },
                    repoLink: repoUrl,
                    profileLink: demoUrl || '',
                    summary: summary || '',
                    status: 'submitted'
                }
            });
        }

        res.status(201).json({
            id: String(submission.id),
            teamId: String(submission.teamId),
            teamName: team.name,
            repoUrl: submission.repoLink,
            demoUrl: submission.profileLink || undefined,
            summary: submission.summary || '',
            status: submission.status,
            mlAnalysis: submission.summary ? {
                summary: submission.summary || '',
                classification: submission.classification || '',
                techStack: submission.techStack ? submission.techStack.split(',').map(s => s.trim()) : [],
                complexity: submission.complexity || '',
                usabilityScore: submission.usabilityScore || 0,
            } : undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/submissions/:submissionId/score
 */
router.post('/:submissionId/score', authMiddleware, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { score } = req.body;

        const submission = await prisma.submission.findUnique({
            where: { id: Number(submissionId) },
            include: { team: true }
        });

        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const judge = await prisma.judge.findFirst({ where: { userId: req.user.id } });
        if (!judge) return res.status(403).json({ message: 'Judge profile not found' });

        const existing = await prisma.score.findFirst({
            where: { judgeId: judge.id, teamId: submission.teamId }
        });

        let scoreRecord;
        if (existing) {
            scoreRecord = await prisma.score.update({
                where: { id: existing.id },
                data: {
                    innovationScore: Number(score) / 3,
                    technicalScore: Number(score) / 3,
                    usabilityScore: Number(score) / 3,
                    finalScore: Number(score)
                }
            });
        } else {
            scoreRecord = await prisma.score.create({
                data: {
                    judgeId: judge.id,
                    teamId: submission.teamId,
                    innovationScore: Number(score) / 3,
                    technicalScore: Number(score) / 3,
                    usabilityScore: Number(score) / 3,
                    finalScore: Number(score)
                }
            });
        }

        res.json({
            id: String(submission.id),
            teamId: String(submission.teamId),
            teamName: submission.team.name,
            repoUrl: submission.repoLink,
            summary: submission.summary || '',
            status: submission.status,
            score: scoreRecord.finalScore,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
