const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const leaderboardService = require('../services/leaderboard.service');

const mapEntries = (entries) =>
    entries.map((entry) => ({
        rank: entry.rank,
        teamId: String(entry.teamId),
        teamName: entry.team.name,
        projectName: entry.submission.summary || 'Untitled Project',
        score: entry.totalScore,
    }));

const resolveUserRole = (req) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.role || null;
    } catch {
        return null;
    }
};

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

        await leaderboardService.recalculateLeaderboard(publishedEvent.id);
        const entries = await leaderboardService.getLeaderboardByEvent(publishedEvent.id);

        res.json({ isPublished: true, entries: mapEntries(entries) });
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
        const events = await prisma.event.findMany({ select: { id: true } });
        for (const event of events) {
            await leaderboardService.recalculateLeaderboard(event.id);
        }

        const allEntries = await prisma.leaderboardEntry.findMany({
            include: { team: true, submission: true },
            orderBy: [{ rank: 'asc' }, { totalScore: 'desc' }],
        });

        res.json({ isPublished: true, entries: mapEntries(allEntries) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/leaderboard/:eventId
 */
router.get('/:eventId', async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);
        if (Number.isNaN(eventId)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { leaderboardPublished: true },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const role = resolveUserRole(req);
        const canViewUnpublished = role === 'judge' || role === 'organizer';
        const published = Boolean(event.leaderboardPublished);

        if (!published && !canViewUnpublished) {
            return res.json({ published: false, entries: [] });
        }

        await leaderboardService.recalculateLeaderboard(eventId);
        const entries = await leaderboardService.getLeaderboardByEvent(eventId);

        res.json({ published, entries: mapEntries(entries) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
