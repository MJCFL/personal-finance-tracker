const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Get enrollment token for Teller
router.get('/enrollment-token', accountController.getEnrollmentToken);

// List all accounts
router.get('/list', accountController.listAccounts);

// Get transactions for an account
router.get('/:accountId/transactions', accountController.getTransactions);

// Get balance for an account
router.get('/:accountId/balance', accountController.getBalance);

module.exports = router;
