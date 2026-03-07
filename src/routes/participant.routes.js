const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const participantController = require('../controllers/participant.controller');

router.post(
  '/team',
  authMiddleware,
  roleMiddleware('participant'),
  participantController.createTeam
);

router.post(
  '/submission',
  authMiddleware,
  roleMiddleware('participant'),
  participantController.submitProject
);

module.exports = router;