const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// GET /api/courses/:id
router.get('/:id', courseController.getCourseById);

// POST /api/courses
router.post('/', courseController.createCourse);

// GET /api/courses
router.get('/', courseController.getAllCourses);

module.exports = router;