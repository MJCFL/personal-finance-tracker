const axios = require('axios');

class TellerService {
  constructor() {
    this.apiBase = 'https://api.teller.io';
    this.headers = {
      'Authorization': `Bearer ${process.env.TELLER_API_KEY}`,
      'Content-Type': 'application/json',
      'Teller-Version': '2020-10-12'
    };
  }

  // Generate enrollment token for the frontend
  async generateEnrollmentToken(userId) {
    try {
      const response = await axios.post(`${this.apiBase}/enrollment/tokens`, {
        user_id: userId
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error generating enrollment token:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get all accounts for a user
  async getAccounts(accessToken) {
    try {
      const response = await axios.get(`${this.apiBase}/accounts`, {
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get transactions for an account
  async getTransactions(accessToken, accountId) {
    try {
      const response = await axios.get(`${this.apiBase}/accounts/${accountId}/transactions`, {
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get balance for an account
  async getBalance(accessToken, accountId) {
    try {
      const response = await axios.get(`${this.apiBase}/accounts/${accountId}/balances`, {
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new TellerService();
