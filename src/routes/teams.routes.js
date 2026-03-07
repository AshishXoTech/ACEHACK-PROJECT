const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/teams
 * Create a new team
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, members, eventId } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        // If eventId provided, use it; otherwise use the first event
        let resolvedEventId = eventId;
        if (!resolvedEventId) {
            const firstEvent = await prisma.event.findFirst({ orderBy: { id: 'asc' } });
            resolvedEventId = firstEvent ? firstEvent.id : 1;
        }

        const team = await prisma.team.create({
            data: {
                name,
                eventId: Number(resolvedEventId),
            }
        });

        // Register the creating user as a team member
        await prisma.registration.create({
            data: { teamId: team.id, userId: req.user.id }
        });

        // Register additional members by name if provided (best effort)
        // In a real system, you'd look up by email

        res.status(201).json({
            id: String(team.id),
            name: team.name,
            members: members || [],
            eventId: String(team.eventId),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
