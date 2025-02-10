const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/expenses', authMiddleware, expenseController.addExpense);
router.get('/expenses', authMiddleware, expenseController.getExpenses);
router.delete('/expenses/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;
