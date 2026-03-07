const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const organizerController = require('../controllers/organizer.controller');

router.post(
  '/event',
  authMiddleware,
  roleMiddleware('organizer'),
  organizerController.createEvent
);

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('organizer'),
  (req, res) => {
    res.json({ message: 'Organizer dashboard', user: req.user });
  }
);

router.post(
  '/create-judge',
  authMiddleware,
  roleMiddleware('organizer'),
  organizerController.createJudge
);

router.post(
  '/assign-judge',
  authMiddleware,
  roleMiddleware('organizer'),
  organizerController.assignJudge
);

router.get(
  '/registrations',
  authMiddleware,
  roleMiddleware('organizer'),
  organizerController.viewRegistrations
);

router.get(
  '/leaderboard/:eventId',
  authMiddleware,
  roleMiddleware('organizer'),
  organizerController.generateLeaderboard
);

router.post(
  '/generate-certificates',
  authMiddleware,
  roleMiddleware('organizer'),
  organizerController.generateCertificates
);

module.exports = router;