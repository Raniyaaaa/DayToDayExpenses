const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/details', authMiddleware,authController.getUser)
router.post('/forgot-password', authController.forgetPassword)
router.post('/reset-password', authController.resetPassword)

module.exports = router;