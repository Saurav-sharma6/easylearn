// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//  NEW LOGIN FUNCTION BELOW

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email Not Found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password does not Match' });
    }

    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '2h' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '2d' });
    user.refreshToken = refreshToken;
    await user.save();

    // Set session data
    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.role = user.role;
      await new Promise((resolve) => req.session.save(resolve)); // to save the session
      console.log('Session saved:', req.session);
      
    } else {
      console.error('req.session is undefined');
    }
    
    // Send response with token
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.session?.refreshToken;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.refreshToken = null;
    await user.save();

    if (req.session) {
      req.session.destroy(err => {
        if (err) console.error('Session destroy error:', err);
      });
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });
      const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '2h' });
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (email.length > 100) {
      return res.status(400).json({ message: 'Email address is too long' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Reset Your Password</h1>
        <p>Click <a href="${resetUrl}" target="_blank" style="color: #1a73e8; text-decoration: underline;">here</a> to reset your password. Link expires in 1 hour.</p>
      </body>
      </html>
    `;
    const text = `If the above link is not working, copy and paste the url to Reset your password at: ${resetUrl}`;
    await sendEmail(email, 'Password Reset Request', html, text);

    res.json({ message: 'Reset link sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Password must be less than 128 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
    user.password = hashedPassword
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const { search, sort, limit = 5, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = User.find().select('_id name email role');
    if (search) {
      query = query.where({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { role: new RegExp(search, 'i') },
        ],
      }); // Case-insensitive search by name
    }

    const total = await User.countDocuments(query);
    const users = await query
      .sort(sort ? { [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 } : { name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
      

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserCount = async (req, res) => {
  console.log("HERE")
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    console.log("USER GET")
    const user = await User.findById(req.params.id).select('_id name email role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, role } = req.body;

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate role
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Update user
    user.name = name;
    user.email = email;
    user.role = role;

    const updatedUser = await user.save();
    res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
     console.log(`Deleting user with ID: ${req.params.id}`);
    console.log('Authenticated user:', req.user); // Debug: log req.user
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(`User not found: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.user || (!req.user._id && !req.user.userId)) {
      console.log('Invalid req.user:', req.user);
      return res.status(401).json({ message: 'Unauthorized: Invalid user data' });
    }

    const currentUserId = req.user._id || req.user.userId;
    if (currentUserId.toString() === req.params.id) {
      console.log('Self-deletion attempt by:', currentUserId);
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    console.log(`User deleted: ${req.params.id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};