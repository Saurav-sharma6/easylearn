const Course = require('../models/Course');

// GET /api/courses - Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { search, sort, limit = 5, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = Course.find().select('title price originalPrice instructorId');
    if (search) {
      query = query.where('title', new RegExp(search, 'i')); // Search by title
    }

    const total = await Course.countDocuments(query);
    const courses = await query
      .sort(sort ? { [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 } : { title: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      courses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
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


// count the course
exports.getCourseCount = async (req, res) => {
  try {
    const count = await Course.countDocuments();
    res.json({ totalCourses: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};