// Temporary in-memory storage (will be replaced with MongoDB later)
const users = [];

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // In a real app, we would hash the password here
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // Note: In production, this would be hashed
        name,
        createdAt: new Date()
      };

      users.push(newUser);

      // Don't send password back in response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // In a real app, we would:
      // 1. Compare hashed passwords
      // 2. Generate a JWT token
      // 3. Set up a session

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token: 'dummy-token' // This would be a real JWT token in production
      });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      // In a real app, we would get the user ID from the JWT token
      // For now, just return a dummy profile
      res.json({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: 'Error getting profile' });
    }
  }
};

module.exports = authController;
