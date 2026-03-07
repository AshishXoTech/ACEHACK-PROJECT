const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/register', (req, res, next) => {
  console.log("REGISTER ROUTE HIT");
  next();
}, authController.register);

router.post('/login', authController.login);

module.exports = router;