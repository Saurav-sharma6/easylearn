const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');

// Configure Multer for multiple video uploads
const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    console.log('Multer processing file:', file.originalname, file.mimetype); // Debug
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// Configure Multer for single video upload
const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    console.log('Multer processing single file:', file.originalname, file.mimetype); // Debug
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// const debugFiles = (req, res, next) => {
//   console.log('Incoming request files:', req.files);
//   console.log('Incoming request body:', req.body);
//   next();
// };

// Route handlers
router.get('/count', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.getCourseCount);
router.get('/list', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.getAllCoursesAdmin);
router.post('/', [authenticateToken, roleMiddleware(['instructor', 'admin']), uploadMultiple.array('lectureVideos')], courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', [authenticateToken, roleMiddleware(['student', 'instructor', 'admin'])], courseController.getCourseById);
router.get('/instructor/:instructorId', courseController.getCoursesByInstructorId);
router.put('/:id', [authenticateToken, roleMiddleware(['instructor', 'admin']), uploadMultiple.array('lectureVideos')], courseController.updateCourse);
router.delete('/:id', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.deleteCourse);
router.patch('/lectures/:lectureId/video', [authenticateToken, roleMiddleware(['instructor', 'admin']), uploadSingle.single('file')], courseController.updateLectureVideo);
router.post('/progress', [authenticateToken, roleMiddleware(['student'])], courseController.updateProgress);
router.get('/progress/:userId/:courseId', [authenticateToken, roleMiddleware(['student'])], courseController.getUserProgress);
router.post('/certificates/generate', courseController.generateCertificate);

module.exports = router;