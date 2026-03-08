const prisma = require('../config/prisma');

let intervalRef = null;

async function processDueAlerts() {
  try {
    const now = new Date();
    const due = await prisma.alert.findMany({
      where: {
        delivered: false,
        scheduledAt: { lte: now },
      },
      select: { id: true },
      orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
    });

    if (!due.length) return;

    await prisma.alert.updateMany({
      where: { id: { in: due.map((row) => row.id) } },
      data: { delivered: true },
    });

    console.log(`[AlertScheduler] Delivered ${due.length} alert(s).`);
  } catch (error) {
    console.error('[AlertScheduler] Failed:', error?.message || error);
  }
}

function startAlertScheduler() {
  if (intervalRef) return;
  intervalRef = setInterval(processDueAlerts, 60 * 1000);
  processDueAlerts();
  console.log('[AlertScheduler] Started (every 60s).');
}

module.exports = {
  startAlertScheduler,
  processDueAlerts,
};

