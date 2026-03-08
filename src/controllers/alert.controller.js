const prisma = require('../config/prisma');

const toAlertDto = (alert, createdByName) => ({
  id: String(alert.id),
  eventId: String(alert.eventId),
  title: alert.title,
  message: alert.message,
  createdBy: String(alert.createdBy),
  createdByName: createdByName || 'Organizer',
  scheduledAt: alert.scheduledAt,
  isInstant: Boolean(alert.isInstant),
  delivered: Boolean(alert.delivered),
  createdAt: alert.createdAt,
});

exports.createAlert = async (req, res) => {
  try {
    const { eventId, title, message, isInstant, scheduledAt } = req.body || {};
    const eventIdNum = Number(eventId);

    if (Number.isNaN(eventIdNum) || !title || !message) {
      return res.status(400).json({ message: 'eventId, title and message are required' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
      select: { id: true, organizerId: true },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied for this event' });
    }

    const instant = Boolean(isInstant);
    const finalSchedule = instant ? new Date() : new Date(scheduledAt);

    if (Number.isNaN(finalSchedule.getTime())) {
      return res.status(400).json({ message: 'Valid scheduledAt is required for scheduled alerts' });
    }

    const alert = await prisma.alert.create({
      data: {
        eventId: eventIdNum,
        title: String(title).trim(),
        message: String(message).trim(),
        createdBy: req.user.id,
        scheduledAt: finalSchedule,
        isInstant: instant,
        delivered: instant,
      },
    });

    const creator = await prisma.user.findUnique({
      where: { id: alert.createdBy },
      select: { name: true },
    });
    return res.status(201).json(toAlertDto(alert, creator?.name));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventAlerts = async (req, res) => {
  try {
    const eventIdNum = Number(req.params.eventId);
    if (Number.isNaN(eventIdNum)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    if (req.user.role === 'participant') {
      const registration = await prisma.registration.findFirst({
        where: {
          userId: req.user.id,
          team: { eventId: eventIdNum },
        },
        select: { id: true },
      });

      if (!registration) {
        return res.status(403).json({ message: 'Access denied for this event' });
      }
    } else if (req.user.role === 'organizer') {
      const event = await prisma.event.findUnique({
        where: { id: eventIdNum },
        select: { organizerId: true },
      });

      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied for this event' });
      }
    } else if (req.user.role !== 'judge') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const alerts = await prisma.alert.findMany({
      where: {
        eventId: eventIdNum,
        OR: [
          { delivered: true },
          { scheduledAt: { lte: now } },
        ],
      },
      orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
    });

    const creatorIds = Array.from(new Set(alerts.map((a) => a.createdBy)));
    const creators = creatorIds.length
      ? await prisma.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, name: true },
      })
      : [];
    const creatorMap = new Map(creators.map((u) => [u.id, u.name]));

    return res.json(alerts.map((alert) => toAlertDto(alert, creatorMap.get(alert.createdBy))));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.processScheduledAlerts = async (req, res) => {
  try {
    const now = new Date();
    const due = await prisma.alert.findMany({
      where: {
        delivered: false,
        scheduledAt: { lte: now },
      },
      orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
    });

    if (due.length === 0) {
      return res.json({ processed: 0 });
    }

    const ids = due.map((a) => a.id);
    await prisma.alert.updateMany({
      where: { id: { in: ids } },
      data: { delivered: true },
    });

    return res.json({ processed: ids.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
