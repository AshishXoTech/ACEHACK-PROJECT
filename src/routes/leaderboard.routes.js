const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');

function resolveRoleFromToken(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.role || null;
    } catch (_) {
        return null;
    }
}

/**
 * GET /api/leaderboard/public
 */
router.get('/public', async (req, res) => {
    try {
        // Get the most recent event that has its leaderboard published
        const events = await prisma.event.findMany({ orderBy: { id: 'desc' } });
        const publishedEvent = events.find(e => e.leaderboardPublished) || null;

        if (!publishedEvent) {
            return res.json({ isPublished: false, entries: [] });
        }

        const teams = await prisma.team.findMany({
            where: { eventId: publishedEvent.id },
            include: { scores: true }
        });

        const entries = teams
            .map(t => ({
                teamId: String(t.id),
                teamName: t.name,
                score: t.scores.reduce((sum, s) => sum + s.finalScore, 0)
            }))
            .filter(e => e.score > 0)
            .sort((a, b) => b.score - a.score);

        res.json({ isPublished: true, entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/leaderboard/live  (requires auth)
 */
router.get('/live', authMiddleware, async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: { scores: true }
        });

        const entries = teams
            .map(t => ({
                teamId: String(t.id),
                teamName: t.name,
                score: t.scores.reduce((sum, s) => sum + s.finalScore, 0)
            }))
            .sort((a, b) => b.score - a.score);

        res.json({ isPublished: true, entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/leaderboard/:eventId
 * Judges and organizers can view anytime.
 * Participants/public can view only if published.
 */
router.get('/:eventId', async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);
        if (Number.isNaN(eventId)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { leaderboardPublished: true }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const role = resolveRoleFromToken(req);
        const canViewUnpublished = role === 'judge' || role === 'organizer';

        if (!event.leaderboardPublished && !canViewUnpublished) {
            return res.json({ published: false, entries: [] });
        }

        const teams = await prisma.team.findMany({
            where: { eventId },
            include: { scores: true }
        });

        const entries = teams
            .map((team) => ({
                teamId: String(team.id),
                teamName: team.name,
                score: team.scores.reduce((sum, score) => sum + score.finalScore, 0)
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                rank: index + 1,
                ...entry
            }));

        res.json({
            published: event.leaderboardPublished,
            entries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/leaderboard/publish
 * Body: { eventId }
 */
router.post('/publish', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Only organizers can publish leaderboard' });
        }

        const eventId = Number(req.body?.eventId);
        if (Number.isNaN(eventId)) {
            return res.status(400).json({ message: 'eventId is required' });
        }

        await prisma.event.update({
            where: { id: eventId },
            data: { leaderboardPublished: true }
        });

        res.json({ message: 'Leaderboard published' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
