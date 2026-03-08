const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * GET /api/events
 * Returns all events (authenticated)
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const where = req.user?.role === 'organizer'
            ? { organizerId: req.user.id }
            : {};

        const events = await prisma.event.findMany({
            where,
            orderBy: { startDate: 'desc' }
        });

        const mapped = events.map(e => ({
            id: String(e.id),
            title: e.name,
            description: e.description,
            organizerId: String(e.organizerId),
            location: e.location || '',
            startDate: e.startDate ? e.startDate.toISOString() : '',
            endDate: e.endDate ? e.endDate.toISOString() : '',
            tracks: e.tracks ? (Array.isArray(e.tracks) ? e.tracks : JSON.parse(e.tracks)) : [],
            publicUrl: e.publicUrl || undefined,
            rulesUrl: e.rulesUrl || undefined,
        }));

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/leaderboard
 * Public leaderboard for a specific event
 */
router.get('/:eventId/leaderboard', async (req, res) => {
    try {
        const { eventId } = req.params;
        const id = Number(eventId);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const event = await prisma.event.findUnique({
            where: { id },
            select: { id: true, leaderboardPublished: true }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.leaderboardPublished) {
            return res.json({ published: false, entries: [] });
        }

        const teams = await prisma.team.findMany({
            where: { eventId: id },
            include: { scores: true }
        });

        const entries = teams
            .map(t => ({
                teamId: String(t.id),
                teamName: t.name,
                score: t.scores.reduce((sum, s) => sum + s.totalScore, 0)
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                rank: index + 1,
                ...entry,
            }));

        res.json({ published: true, entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/resources
 * Returns event resource links/details for participants
 */
router.get('/:eventId/resources', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const id = Number(eventId);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const event = await prisma.event.findUnique({
            where: { id },
            select: {
                publicUrl: true,
                rulesUrl: true,
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            discord: event.publicUrl || "",
            rulebook: event.rulesUrl || "",
            datasets: [],
            apiKeys: [],
            mentorSchedule: "",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId
 * Returns a single event
 */
router.get('/:eventId', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await prisma.event.findUnique({
            where: { id: Number(eventId) }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            id: String(event.id),
            title: event.name,
            description: event.description,
            location: event.location || '',
            startDate: event.startDate ? event.startDate.toISOString() : '',
            endDate: event.endDate ? event.endDate.toISOString() : '',
            tracks: event.tracks
                ? (Array.isArray(event.tracks) ? event.tracks : JSON.parse(event.tracks))
                : [],
            publicUrl: event.publicUrl || undefined,
            rulesUrl: event.rulesUrl || undefined,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events
 * Create new event (organizer only)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, location, startDate, endDate, tracks, publicUrl } = req.body;

        if (!title || !description || !startDate || !endDate) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const event = await prisma.event.create({
            data: {
                name: title,
                description,
                location: location || '',
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                organizerId: req.user.id,
                tracks: tracks ? JSON.stringify(tracks) : '[]',
                publicUrl: publicUrl || null,
            }
        });

        res.status(201).json({
            id: String(event.id),
            title: event.name,
            description: event.description,
            location: event.location || '',
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            tracks: tracks || [],
            publicUrl: event.publicUrl || undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/rules
 * Upload rules file (with multipart — simplified to just save URL reference)
 */
router.post('/:eventId/rules', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        // In a real scenario, you'd handle file upload here.
        // For now, just acknowledge and return updated event.
        const event = await prisma.event.update({
            where: { id: Number(eventId) },
            data: { rulesUrl: `/rules/event-${eventId}-rules.pdf` }
        });
        res.json({
            id: String(event.id),
            title: event.name,
            description: event.description,
            location: event.location || '',
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            tracks: event.tracks ? JSON.parse(event.tracks) : [],
            rulesUrl: event.rulesUrl || undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/public-url
 */
router.post('/:eventId/public-url', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { publicUrl } = req.body;

        const event = await prisma.event.update({
            where: { id: Number(eventId) },
            data: { publicUrl }
        });
        res.json({
            id: String(event.id),
            title: event.name,
            description: event.description,
            location: event.location || '',
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            tracks: event.tracks ? JSON.parse(event.tracks) : [],
            publicUrl: event.publicUrl || undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/registrations
 */
router.get('/:eventId/registrations', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const teams = await prisma.team.findMany({
            where: { eventId: Number(eventId) },
            include: {
                registrations: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        const result = teams.map(t => ({
            id: String(t.id),
            teamName: t.name,
            members: t.registrations.map(r => r.user.name),
            status: t.status || 'pending',
            track: t.track || undefined,
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/registrations/:teamId/status
 */
router.post('/:eventId/registrations/:teamId/status', authMiddleware, async (req, res) => {
    try {
        const { teamId } = req.params;
        const { status } = req.body;

        const team = await prisma.team.update({
            where: { id: Number(teamId) },
            data: { status }
        });

        res.json({
            id: String(team.id),
            teamName: team.name,
            members: [],
            status: team.status || 'pending',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/registrations/:teamId/send-credentials
 */
router.post('/:eventId/registrations/:teamId/send-credentials', authMiddleware, async (req, res) => {
    try {
        // In a real system, send emails here.
        res.json({ message: 'Credentials sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/assign-judge
 */
router.post('/:eventId/assign-judge', authMiddleware, async (req, res) => {
    try {
        const { teamId, judgeId } = req.body;

        const judge = await prisma.judge.findFirst({
            where: { userId: Number(judgeId) }
        });

        if (!judge) {
            return res.status(404).json({ message: 'Judge profile not found for this user' });
        }

        const assignment = await prisma.judgeAssignment.create({
            data: {
                judgeId: judge.id,
                teamId: Number(teamId)
            },
            include: {
                judge: { include: { user: { select: { id: true, name: true } } } },
                team: true,
            }
        });

        res.status(201).json({
            id: String(assignment.id),
            teamId: String(assignment.teamId),
            teamName: assignment.team.name,
            judgeId: String(assignment.judgeId),
            judgeName: assignment.judge.user.name,
            evaluated: false,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/judge-assignments
 */
router.get('/:eventId/judge-assignments', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const assignments = await prisma.judgeAssignment.findMany({
            where: { team: { eventId: Number(eventId) } },
            include: {
                judge: { include: { user: { select: { id: true, name: true } } } },
                team: true,
            }
        });

        const result = assignments.map(a => ({
            id: String(a.id),
            teamId: String(a.teamId),
            teamName: a.team.name,
            judgeId: String(a.judgeId),
            judgeName: a.judge.user.name,
            evaluated: false,
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/analytics
 */
router.get('/:eventId/analytics', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const teams = await prisma.team.findMany({
            where: { eventId: Number(eventId) },
            include: { submission: true, scores: true }
        });

        const totalTeams = teams.length;
        const totalSubmissions = teams.filter(t => t.submission).length;
        const pendingEvaluations = teams.filter(t => t.submission && t.scores.length === 0).length;

        const topTeams = teams
            .map(t => ({
                teamId: String(t.id),
                teamName: t.name,
                score: t.scores.reduce((sum, s) => sum + s.totalScore, 0)
            }))
            .filter(t => t.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        res.json({ totalTeams, totalSubmissions, pendingEvaluations, topTeams });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/submissions
 */
router.get('/:eventId/submissions', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const teams = await prisma.team.findMany({
            where: { eventId: Number(eventId) },
            include: { submission: true, scores: true }
        });

        const result = teams
            .filter(t => t.submission)
            .map(t => {
                const sub = t.submission;
                return {
                    id: String(sub.id),
                    teamId: String(t.id),
                    teamName: t.name,
                    projectName: sub.summary
                        ? sub.summary.split('\n')[0].slice(0, 60)
                        : `${t.name} Project`,
                    repoUrl: sub.repoLink,
                    demoUrl: sub.profileLink || undefined,
                    summary: sub.summary || '',
                    status: sub.status,
                    score: t.scores.length > 0
                        ? t.scores.reduce((sum, s) => sum + s.totalScore, 0)
                        : undefined,
                    mlAnalysis: sub.summary ? {
                        summary: sub.summary || '',
                        category: sub.classification || '',
                        classification: sub.classification || '',
                        techStack: sub.techStack ? sub.techStack.split(',').map(s => s.trim()) : [],
                        complexity: sub.complexity || '',
                        usabilityScore: sub.usabilityScore || 0,
                        commitStats: {
                            total: sub.commitTotal || 0,
                            last7Days: sub.commitLast7Days || 0,
                            last30Days: sub.commitLast30Days || 0,
                        },
                    } : undefined,
                };
            });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/register  (participants register team)
 */
router.post('/:eventId/register', authMiddleware, async (req, res) => {
    try {
        const { teamId } = req.body;
        const { eventId } = req.params;

        const team = await prisma.team.findUnique({ where: { id: Number(teamId) } });
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Register current user to the team if not already
        const existing = await prisma.registration.findFirst({
            where: { teamId: Number(teamId), userId: req.user.id }
        });

        if (!existing) {
            await prisma.registration.create({
                data: { teamId: Number(teamId), userId: req.user.id }
            });
        }

        res.json({ message: 'Team registered for event' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/leaderboard/publish
 */
router.post('/:eventId/leaderboard/publish', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        await prisma.event.update({
            where: { id: Number(eventId) },
            data: { leaderboardPublished: true }
        });
        res.json({ message: 'Leaderboard published' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/events/:eventId/certificates/:teamId
 * Download participant certificate for an event
 */
router.get('/:eventId/certificates/:teamId', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventIdNum = Number(eventId);

        if (Number.isNaN(eventIdNum)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const cert = await prisma.certificate.findFirst({
            where: {
                eventId: eventIdNum,
                userId: req.user.id,
            }
        });

        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.redirect(cert.certificateUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/events/:eventId/certificates/generate
 */
router.post('/:eventId/certificates/generate', authMiddleware, async (req, res) => {
    try {
        res.json({ message: 'Certificate generation started' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
