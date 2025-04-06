const tellerService = require('../services/tellerService');

const accountController = {
  // Generate enrollment token for frontend
  getEnrollmentToken: async (req, res) => {
    try {
      // In production, get userId from authenticated session
      const userId = 'test-user-123';
      const token = await tellerService.generateEnrollmentToken(userId);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error generating enrollment token' });
    }
  },

  // List all accounts
  listAccounts: async (req, res) => {
    try {
      const { accessToken } = req.headers;
      if (!accessToken) {
        return res.status(401).json({ error: 'Access token required' });
      }
      const accounts = await tellerService.getAccounts(accessToken);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching accounts' });
    }
  },

  // Get account transactions
  getTransactions: async (req, res) => {
    try {
      const { accessToken } = req.headers;
      const { accountId } = req.params;
      if (!accessToken) {
        return res.status(401).json({ error: 'Access token required' });
      }
      const transactions = await tellerService.getTransactions(accessToken, accountId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching transactions' });
    }
  },

  // Get account balance
  getBalance: async (req, res) => {
    try {
      const { accessToken } = req.headers;
      const { accountId } = req.params;
      if (!accessToken) {
        return res.status(401).json({ error: 'Access token required' });
      }
      const balance = await tellerService.getBalance(accessToken, accountId);
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching balance' });
    }
  }
};

module.exports = accountController;
