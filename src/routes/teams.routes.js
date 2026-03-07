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

/**
 * GET /api/teams/:eventId
 * Returns current user's team for an event
 */
router.get('/:eventId', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventIdNum = Number(eventId);

        if (Number.isNaN(eventIdNum)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const registration = await prisma.registration.findFirst({
            where: {
                userId: req.user.id,
                team: { eventId: eventIdNum },
            },
            include: {
                team: {
                    include: {
                        registrations: {
                            include: {
                                user: { select: { id: true, name: true, email: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!registration) {
            return res.json(null);
        }

        const team = registration.team;
        const leaderRegistration = team.registrations[0] || null;

        res.json({
            id: String(team.id),
            name: team.name,
            eventId: String(team.eventId),
            leader: leaderRegistration ? {
                id: String(leaderRegistration.user.id),
                name: leaderRegistration.user.name,
                email: leaderRegistration.user.email,
            } : null,
            members: team.registrations.map((r) => ({
                id: String(r.user.id),
                name: r.user.name,
                email: r.user.email,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * DELETE /api/teams/:eventId/leave
 * Removes current user registration from team in event
 */
router.delete('/:eventId/leave', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventIdNum = Number(eventId);

        if (Number.isNaN(eventIdNum)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const registration = await prisma.registration.findFirst({
            where: {
                userId: req.user.id,
                team: { eventId: eventIdNum }
            }
        });

        if (!registration) {
            return res.status(404).json({ message: 'You are not part of a team for this event' });
        }

        await prisma.registration.delete({
            where: { id: registration.id }
        });

        res.json({ message: 'Left team successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
