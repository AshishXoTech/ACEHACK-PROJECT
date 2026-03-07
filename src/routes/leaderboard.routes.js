const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');

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

module.exports = router;
