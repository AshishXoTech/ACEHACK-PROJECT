const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * GET /api/participant/events/:eventId/submission
 */
router.get('/events/:eventId/submission', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const team = await prisma.team.findFirst({
            where: {
                eventId: Number(eventId),
                registrations: { some: { userId: req.user.id } }
            },
            include: {
                submission: true,
                scores: true,
            }
        });

        if (!team || !team.submission) {
            return res.json(null);
        }

        const sub = team.submission;
        res.json({
            id: String(sub.id),
            teamId: String(team.id),
            teamName: team.name,
            repoUrl: sub.repoLink,
            demoUrl: sub.profileLink || undefined,
            summary: sub.summary || '',
            status: sub.status,
            score: team.scores.length > 0 ? team.scores[0].finalScore : undefined,
            mlAnalysis: sub.summary ? {
                summary: sub.summary || '',
                classification: sub.classification || '',
                techStack: sub.techStack ? sub.techStack.split(',').map(s => s.trim()) : [],
                complexity: sub.complexity || '',
                usabilityScore: sub.usabilityScore || 0,
            } : undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/participant/events/:eventId/stats
 */
router.get('/events/:eventId/stats', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const teams = await prisma.team.findMany({
            where: {
                eventId: Number(eventId),
                registrations: { some: { userId: req.user.id } }
            },
            include: { submission: true, scores: true }
        });

        const submissions = teams.filter(t => t.submission);
        const allScores = teams.flatMap(t => t.scores.map(s => s.finalScore));
        const avgScore = allScores.length
            ? allScores.reduce((a, b) => a + b, 0) / allScores.length
            : undefined;

        res.json({
            submissionsCount: submissions.length,
            averageScore: avgScore,
            lastSubmittedAt: undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/participant/certificates
 */
router.get('/certificates', authMiddleware, async (req, res) => {
    try {
        const certs = await prisma.certificate.findMany({
            where: { userId: req.user.id },
            include: {
                event: { select: { name: true } }
            }
        });

        const result = certs.map(c => ({
            id: String(c.id),
            teamName: `User ${req.user.id}`,
            eventTitle: c.event.name,
            fileName: c.certificateUrl,
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/participant/certificates/:certificateId  (returns PDF blob)
 */
router.get('/certificates/:certificateId', authMiddleware, async (req, res) => {
    try {
        const { certificateId } = req.params;
        const cert = await prisma.certificate.findUnique({
            where: { id: Number(certificateId) }
        });

        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        // Serve the file (the URL should be a relative path like /certificates/file.pdf)
        res.redirect(cert.certificateUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
