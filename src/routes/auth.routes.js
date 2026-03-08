const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/register', (req, res, next) => {
  console.log("REGISTER ROUTE HIT");
  next();
}, authController.register);

router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);

module.exports = router;
