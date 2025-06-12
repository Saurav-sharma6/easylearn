
const User = require('../models/User');

// Register a new user
exports.register = async (req, res) => {
  try {
    // In a real app, you'd hash the password here
    const user = new User(req.body);
    await user.save();
    
    // Don't return the password
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(201).json(userObj);
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // In a real app, you'd compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // In a real app, you'd generate and return a JWT token here
    const token = "sample-token-" + Date.now();
    
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(200).json({ 
      user: userObj,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the authenticated token
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    // Don't allow password updates through this route
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
};
