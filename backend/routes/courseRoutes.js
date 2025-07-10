const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const {authenticateToken, roleMiddleware} = require('../middleware/auth');


router.get('/count', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.getCourseCount);
router.get('/list', [authenticateToken, roleMiddleware(['instructor', 'admin'])], courseController.getAllCoursesAdmin);


// GET /api/courses/:id
router.get('/:id', courseController.getCourseById);
// [authenticateToken, roleMiddleware(['instructor', 'admin'])]
// POST /api/courses
router.post('/', courseController.createCourse);

// GET /api/courses
router.get('/', courseController.getAllCourses);

module.exports = router;