const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const judgeController = require('../controllers/judge.controller');


// =========================
// GET ASSIGNED TEAMS
// =========================
router.get(
  '/assigned-teams',
  authMiddleware,
  roleMiddleware('judge'),
  judgeController.getAssignedTeams
);

router.get(
  '/assignments/:eventId',
  authMiddleware,
  roleMiddleware('organizer'),
  judgeController.getAssignmentsForEvent
);

router.post(
  '/assign',
  authMiddleware,
  roleMiddleware('organizer'),
  judgeController.assignJudgeToTeam
);

// =========================
// GET TEAM SUBMISSION DETAILS
// =========================
router.get(
  '/submission/:teamId',
  authMiddleware,
  roleMiddleware('judge'),
  judgeController.getSubmissionByTeam
);


// =========================
// SUBMIT SCORE
// =========================
router.post(
  '/score',
  authMiddleware,
  roleMiddleware('judge'),
  judgeController.submitScore
);


// =========================
// JUDGE LEADERBOARD
// =========================
router.get(
  '/leaderboard',
  authMiddleware,
  roleMiddleware('judge'),
  judgeController.getLeaderboard
);


module.exports = router;
