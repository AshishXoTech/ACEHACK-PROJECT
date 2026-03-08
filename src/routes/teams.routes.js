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

        if (!name || !eventId) {
            return res.status(400).json({ message: 'Team name and eventId are required' });
        }

        const resolvedEventId = Number(eventId);
        if (Number.isNaN(resolvedEventId)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const event = await prisma.event.findUnique({ where: { id: resolvedEventId } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const existingRegistration = await prisma.registration.findFirst({
            where: {
                userId: req.user.id,
                team: { eventId: resolvedEventId }
            }
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already part of a team for this event' });
        }

        const team = await prisma.team.create({
            data: {
                name,
                eventId: resolvedEventId,
            }
        });

        // Register the creating user as a team member
        await prisma.registration.create({
            data: { teamId: team.id, userId: req.user.id }
        });

        const invited = [];
        const skipped = [];
        const memberEmails = Array.isArray(members) ? members : [];

        if (memberEmails.length > 0) {
            const users = await prisma.user.findMany({
                where: { email: { in: memberEmails } },
                select: { id: true, email: true },
            });

            const foundEmailSet = new Set(users.map((u) => u.email));
            const userIds = users.map((u) => u.id);

            if (userIds.length > 0) {
                const alreadyRegistered = await prisma.registration.findMany({
                    where: {
                        teamId: team.id,
                        userId: { in: userIds },
                    },
                    select: { userId: true },
                });
                const alreadySet = new Set(alreadyRegistered.map((r) => r.userId));

                const toCreate = userIds
                    .filter((id) => !alreadySet.has(id))
                    .map((id) => ({ teamId: team.id, userId: id }));

                if (toCreate.length > 0) {
                    await prisma.registration.createMany({ data: toCreate });
                }

                for (const user of users) {
                    if (!alreadySet.has(user.id)) {
                        invited.push(user.email);
                    }
                }
            }

            for (const email of memberEmails) {
                if (!foundEmailSet.has(email)) {
                    skipped.push(email);
                }
            }
        }

        const teamWithMembers = await prisma.team.findUnique({
            where: { id: team.id },
            include: {
                registrations: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        res.status(201).json({
            id: String(teamWithMembers.id),
            name: teamWithMembers.name,
            members: teamWithMembers.registrations.map((r) => ({
                id: String(r.user.id),
                name: r.user.name,
                email: r.user.email,
            })),
            invited,
            skipped,
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
