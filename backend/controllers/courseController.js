const Course = require('../models/Course');

// GET /api/courses - Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// GET /api/courses/:id - Get course by MongoDB _id
exports.getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses - Create new course
exports.createCourse = async (req, res) => {
  const {
    title,
    description,
    instructor,
    price,
    originalPrice,
    duration,
    image,
    category,
    level,
    isFeatured,
    isPopular,
    isEnrolled,
  } = req.body;

  if (!title || !instructor || !duration || !image) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingCourse = await Course.findOne({ title, instructor });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    const newCourse = new Course({
      title,
      description,
      instructor,
      price,
      originalPrice,
      duration,
      image,
      category,
      level,
      isEnrolled,
      isFeatured,
      isPopular,
    });

    await newCourse.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add course' });
  }
};