// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token)
  console.log(process.env.JWT_ACCESS_SECRET)

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No Token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log(decoded)
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const roleMiddleware = (roles) => async (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
  }

  // Additional check for instructor course ownership if applicable
  if (req.user.role === 'instructor' && req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.instructorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied. Not your course.' });
    }
    req.course = course; // Attach course to request for use in controllers
  }

  next();
};

// const adminMiddleware = (req, res, next) => {
//   if (req.user?.role !== 'admin') {
//     return res.status(403).json({ message: 'Admin access required' });
//   }
//   next();
// };

// const instructorMiddleware = (req, res, next) => {
//   console.log('User Role:', req.user?.role);
//   if (req.user?.role !== 'admin' && req.user?.role !== 'instructor') {
//     return res.status(403).json({ message: 'Instructor or admin access required' });
//   }
//   next();
// };

// const courseAccessMiddleware = async (req, res, next) => {
//   const courseId = req.params.courseId || req.body.courseId;
//   if (!courseId) {
//     return res.status(400).json({ message: 'Course ID is required' });
//   }
//   const course = await User.findById(courseId).populate('instructorId');
//   if (!course) {
//     return res.status(404).json({ message: 'Course not found' });
//   }
//   if (req.user.role === 'instructor' && course.instructorId.toString() !== req.user.userId) {
//     return res.status(403).json({ message: 'Access denied. Not your course' });
//   }
//   req.course = course;
//   next();
// };

module.exports = { authenticateToken, roleMiddleware };
