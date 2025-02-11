const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, expenseController.addExpense);
router.get('/', authMiddleware, expenseController.getExpenses);
router.delete('/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;
