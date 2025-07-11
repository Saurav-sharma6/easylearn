const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const {authenticateToken, roleMiddleware} = require('../middleware/auth');


router.get('/count', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.getCourseCount);
router.get('/list', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.getAllCoursesAdmin);
// Route handlers
router.post('/', courseController.createCourse);               // Create course
router.get('/', courseController.getAllCourses);                // Get all courses
router.get('/:id', courseController.getCourseById);             // Get course by ID
router.get('/instructor/:instructorId', courseController.getCoursesByInstructorId); // Get courses by instructor ID
router.put('/:id', courseController.updateCourse);              // Update course
router.delete('/:id', courseController.deleteCourse);           // Delete course

module.exports = router;