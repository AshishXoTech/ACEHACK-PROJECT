const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const leaderboardService = require('../services/leaderboard.service');
const mlService = require('../services/ml.service');

/**
 * POST /api/submissions
 * Submit a project
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            eventId,
            teamId: rawTeamId,
            repoUrl,
            summary,
            demoUrl,
            repo,
            description,
            demo,
            projectName,
        } = req.body;

        const parsedEventId = Number(eventId);
        const parsedTeamId = Number(rawTeamId);
        let teamId = Number.isNaN(parsedTeamId) ? null : parsedTeamId;
        const resolvedRepoUrl = repoUrl || repo;
        const resolvedSummary = summary || description || '';
        const resolvedDemoUrl = demoUrl || demo || '';
        const resolvedProjectName = typeof projectName === 'string' ? projectName.trim() : '';

        if (!teamId && !Number.isNaN(parsedEventId)) {
            const registration = await prisma.registration.findFirst({
                where: {
                    userId: req.user.id,
                    team: { eventId: parsedEventId }
                },
                select: { teamId: true }
            });

            if (registration) {
                teamId = registration.teamId;
            }
        }

        if (!teamId || !resolvedRepoUrl) {
            return res.status(400).json({ message: 'teamId and repository URL are required' });
        }

        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (!Number.isNaN(parsedEventId) && team.eventId !== parsedEventId) {
            return res.status(400).json({ message: 'teamId does not belong to eventId' });
        }

        const membership = await prisma.registration.findFirst({
            where: {
                userId: req.user.id,
                teamId,
            },
        });

        if (!membership) {
            return res.status(403).json({ message: 'You are not part of this team' });
        }

        const existing = await prisma.submission.findUnique({ where: { teamId } });

        let analyzedSummary = resolvedSummary;
        let analyzedCategory = null;
        let analyzedTechStack = null;
        let analyzedCommitStats = {
            total: null,
            last7Days: null,
            last30Days: null,
        };

        try {
            const analysis = await mlService.analyzeRepository(resolvedRepoUrl);
            if (analysis && !analysis.error) {
                analyzedSummary = analysis.summary || analyzedSummary;
                analyzedCategory = analysis.category || null;
                analyzedTechStack = Array.isArray(analysis.techStack)
                    ? analysis.techStack.join(', ')
                    : null;
                analyzedCommitStats = {
                    total: Number.isFinite(Number(analysis.commitStats?.total))
                        ? Number(analysis.commitStats.total)
                        : null,
                    last7Days: Number.isFinite(Number(analysis.commitStats?.last7Days))
                        ? Number(analysis.commitStats.last7Days)
                        : null,
                    last30Days: Number.isFinite(Number(analysis.commitStats?.last30Days))
                        ? Number(analysis.commitStats.last30Days)
                        : null,
                };
            }
        } catch (mlError) {
            console.error('ML analysis failed:', mlError.message);
        }

        let submission;
        if (existing) {
            submission = await prisma.submission.update({
                where: { teamId },
                data: {
                    repoLink: resolvedRepoUrl,
                    profileLink: resolvedDemoUrl,
                    summary: analyzedSummary,
                    classification: analyzedCategory,
                    techStack: analyzedTechStack,
                    commitTotal: analyzedCommitStats.total,
                    commitLast7Days: analyzedCommitStats.last7Days,
                    commitLast30Days: analyzedCommitStats.last30Days,
                    analyzedAt: new Date(),
                    status: 'submitted'
                }
            });
        } else {
            submission = await prisma.submission.create({
                data: {
                    team: { connect: { id: teamId } },
                    repoLink: resolvedRepoUrl,
                    profileLink: resolvedDemoUrl,
                    summary: analyzedSummary,
                    classification: analyzedCategory,
                    techStack: analyzedTechStack,
                    commitTotal: analyzedCommitStats.total,
                    commitLast7Days: analyzedCommitStats.last7Days,
                    commitLast30Days: analyzedCommitStats.last30Days,
                    analyzedAt: new Date(),
                    status: 'submitted'
                }
            });
        }

        res.status(201).json({
            id: String(submission.id),
            teamId: String(submission.teamId),
            teamName: resolvedProjectName || team.name,
            repoUrl: submission.repoLink,
            demoUrl: submission.profileLink || undefined,
            summary: submission.summary || '',
            status: submission.status,
            mlAnalysis: submission.summary ? {
                summary: submission.summary || '',
                category: submission.classification || '',
                classification: submission.classification || '',
                techStack: submission.techStack ? submission.techStack.split(',').map(s => s.trim()) : [],
                complexity: submission.complexity || '',
                usabilityScore: submission.usabilityScore || 0,
                commitStats: {
                    total: submission.commitTotal || 0,
                    last7Days: submission.commitLast7Days || 0,
                    last30Days: submission.commitLast30Days || 0,
                },
            } : undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/submissions/analyze
 * Run ML analysis for an existing submission
 */
router.post('/analyze', authMiddleware, async (req, res) => {
    try {
        const { submissionId, teamId, repoUrl } = req.body || {};

        let submission = null;
        if (submissionId) {
            submission = await prisma.submission.findUnique({
                where: { id: Number(submissionId) },
                include: { team: true },
            });
        } else if (teamId) {
            submission = await prisma.submission.findUnique({
                where: { teamId: Number(teamId) },
                include: { team: true },
            });
        }

        if (!submission && repoUrl) {
            const analysis = await mlService.analyzeRepository(repoUrl);
            console.log('[Submission Analyze] Repo URL received:', repoUrl);
            console.log('[Submission Analyze] Final analysis JSON:', analysis);
            return res.json(analysis);
        }

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Judges can only analyze submissions for assigned teams.
        if (req.user.role === 'judge') {
            const judge = await prisma.judge.findUnique({
                where: { userId: req.user.id },
                select: { id: true },
            });

            if (!judge) {
                return res.status(404).json({ message: 'Judge profile not found' });
            }

            const assignment = await prisma.judgeAssignment.findFirst({
                where: { judgeId: judge.id, teamId: submission.teamId },
                select: { id: true },
            });

            if (!assignment) {
                return res.status(403).json({ message: 'You are not assigned to this team' });
            }
        }

        const targetRepo = repoUrl || submission.repoLink;
        if (!targetRepo) {
            return res.status(400).json({ message: 'Repository URL is required for analysis' });
        }

        console.log('[Submission Analyze] Repo URL received:', targetRepo);

        const analysis = await mlService.analyzeRepository(targetRepo);
        if (analysis?.error) {
            return res.status(502).json({ message: 'ML service error', error: analysis.error });
        }

        const normalizedTechStack = Array.isArray(analysis.techStack)
            ? analysis.techStack
            : Array.isArray(analysis.tech_stack)
                ? analysis.tech_stack
                : [];

        const commitFrequency = analysis.commit_frequency || analysis.commitStats || {};
        const updated = await prisma.submission.update({
            where: { id: submission.id },
            data: {
                repoLink: targetRepo,
                summary: analysis.summary || submission.summary || '',
                classification: analysis.category || submission.classification || null,
                techStack: normalizedTechStack.length ? normalizedTechStack.join(', ') : submission.techStack,
                complexity: analysis.complexity || submission.complexity || null,
                commitTotal: Number.isFinite(Number(commitFrequency.total)) ? Number(commitFrequency.total) : submission.commitTotal,
                commitLast7Days: Number.isFinite(Number(commitFrequency.last7Days)) ? Number(commitFrequency.last7Days) : submission.commitLast7Days,
                commitLast30Days: Number.isFinite(Number(commitFrequency.last30Days)) ? Number(commitFrequency.last30Days) : submission.commitLast30Days,
                analyzedAt: new Date(),
            },
            include: { team: true },
        });

        console.log('[Submission Analyze] OpenAI response mapped:', analysis);
        console.log('[Submission Analyze] Final JSON returned for submission:', updated.id);

        return res.json({
            submissionId: String(updated.id),
            teamId: String(updated.teamId),
            summary: updated.summary || '',
            category: updated.classification || '',
            tech_stack: normalizedTechStack,
            techStack: normalizedTechStack,
            complexity: analysis.complexity || updated.complexity || '',
            innovation_score: analysis.innovation_score ?? null,
            commit_frequency: {
                total: updated.commitTotal || 0,
                last7Days: updated.commitLast7Days || 0,
                last30Days: updated.commitLast30Days || 0,
            },
            commitStats: {
                total: updated.commitTotal || 0,
                last7Days: updated.commitLast7Days || 0,
                last30Days: updated.commitLast30Days || 0,
            },
        });
    } catch (error) {
        const upstreamStatus = error?.response?.status || error?.statusCode;
        const upstreamData = error?.response?.data;
        const upstreamMessage = upstreamData?.message || upstreamData?.error || error?.message;

        console.error('[Submission Analyze] Failed:', upstreamData || error.message || error);
        res.status(upstreamStatus || 502).json({
            message: upstreamMessage || 'Failed to analyze submission',
        });
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
        const normalized = Number(score) / 4;
        if (existing) {
            scoreRecord = await prisma.score.update({
                where: { id: existing.id },
                data: {
                    innovation: normalized,
                    technicalComplexity: normalized,
                    design: normalized,
                    impact: normalized,
                    totalScore: Number(score)
                }
            });
        } else {
            scoreRecord = await prisma.score.create({
                data: {
                    judgeId: judge.id,
                    submissionId: submission.id,
                    teamId: submission.teamId,
                    innovation: normalized,
                    technicalComplexity: normalized,
                    design: normalized,
                    impact: normalized,
                    totalScore: Number(score)
                }
            });
        }

        await leaderboardService.recalculateLeaderboard(submission.team.eventId);

        res.json({
            id: String(submission.id),
            teamId: String(submission.teamId),
            teamName: submission.team.name,
            repoUrl: submission.repoLink,
            summary: submission.summary || '',
            status: submission.status,
            score: scoreRecord.totalScore,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
