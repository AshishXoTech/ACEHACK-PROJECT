const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const alertController = require('../controllers/alert.controller');

router.post(
  '/create',
  authMiddleware,
  roleMiddleware('organizer'),
  alertController.createAlert,
);

router.get(
  '/event/:eventId',
  authMiddleware,
  roleMiddleware('organizer', 'participant', 'judge'),
  alertController.getEventAlerts,
);

router.post(
  '/process',
  authMiddleware,
  roleMiddleware('organizer'),
  alertController.processScheduledAlerts,
);

module.exports = router;

