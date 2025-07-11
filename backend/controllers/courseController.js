const Course = require('../models/Course');

// POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      instructorId,
      price,
      originalPrice,
      duration,
      image,
      category,
      level,
      whatWillLearn,
      isFeatured,
      isPopular,
      curriculum, // array of chapters with lecture info
    } = req.body;

    // Validation
    if (!title || !instructorId || !duration || !image) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ error: "Invalid instructorId" });
    }

    const instructorUser = await User.findById(instructorId);
    if (!instructorUser || instructorUser.role !== "instructor") {
      return res
        .status(403)
        .json({ error: "Only instructors can create courses" });
    }

    // Process Chapters and Lectures
    const chapterIds = [];

    for (const chapter of curriculum) {
      const lectureIds = [];

      for (const lecture of chapter.chapterContent || []) {
        const newLecture = new Lecture({
          lectureTitle: lecture.lectureTitle,
          lectureDuration: lecture.lectureDuration,
          lectureUrl: lecture.lectureUrl,
          isPreviewFree: lecture.isPreviewFree || false,
        });

        await newLecture.save();
        lectureIds.push(newLecture._id);
      }

      const newChapter = new Chapter({
        chapterTitle: chapter.chapterTitle,
        chapterContent: lectureIds,
      });

      await newChapter.save();
      chapterIds.push(newChapter._id);
    }

    // Create Course
    const course = new Course({
      title,
      description,
      instructor: instructorUser.name,
      instructorId: instructorUser._id,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      duration,
      image,
      category,
      level,
      whatWillLearn,
      isFeatured,
      isPopular,
      curriculum: chapterIds,
    });

    await course.save();

    // Fully populate instructor and curriculum + nested lectures
    const populatedCourse = await Course.findById(course._id)
      .populate("instructorId", "name email")
      .populate({
        path: "curriculum",
        populate: {
          path: "chapterContent",
          model: "Lecture",
        },
      });

    // Return full populated result
    return res.status(201).json({
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// GET /api/courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate(
      "instructorId",
      "name email"
    ); // Populate instructor details

    res.json({ courses });
  } catch (err) {
    console.error("Failed to load courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    const course = await Course.findById(courseId)
      .populate("instructorId", "name email") // optional: for instructor info
      .populate({
        path: "curriculum",
        model: "Chapter",
        populate: {
          path: "chapterContent",
          model: "Lecture",
        },
      });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json({ course });
  } catch (err) {
    console.error("Error fetching course:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updateData = req.body;

    // If updating instructorId, validate it again
    if (updateData.instructorId) {
      const instructorUser = await User.findById(updateData.instructorId);
      if (!instructorUser || instructorUser.role !== "instructor") {
        return res.status(403).json({ error: "Invalid instructor ID" });
      }

      updateData.instructor = instructorUser.name;
      updateData.instructorId = instructorUser._id;
    }

    // Handle price parsing if provided
    if (updateData.price !== undefined) {
      const parsedPrice = parseFloat(updateData.price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ error: "Invalid price value" });
      }
      updateData.price = parsedPrice;
    }

    if (updateData.originalPrice !== undefined) {
      const parsedOriginalPrice = updateData.originalPrice
        ? parseFloat(updateData.originalPrice)
        : null;
      if (parsedOriginalPrice !== null && isNaN(parsedOriginalPrice)) {
        return res.status(400).json({ error: "Invalid original price value" });
      }
      updateData.originalPrice = parsedOriginalPrice;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    }).populate("instructorId", "name email");

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/courses/instructor/:instructorId
exports.getCoursesByInstructorId = async (req, res) => {
  try {
    const { instructorId } = req.params;

    console.log("[getCoursesByInstructorId] Request received for instructor ID:", instructorId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      console.error("[getCoursesByInstructorId] Invalid instructor ID:", instructorId);
      return res.status(400).json({ error: "Invalid instructor ID" });
    }

    // Fetch courses by instructorId
    const courses = await Course.find({ instructorId }).populate("instructorId", "name email");

    console.log(`[getCoursesByInstructorId] Found ${courses.length} courses for instructor ID:`, instructorId);

    if (!courses || courses.length === 0) {
      return res.json({ message: "No courses found for this instructor", courses: [] });
    }

    res.json({ courses });

  } catch (err) {
    console.error("[getCoursesByInstructorId] Error fetching instructor courses:", err.message || err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/chapters/:id
exports.getChapterById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Chapter ID" });
    }

    const chapter = await Chapter.findById(id).populate("chapterContent");

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    res.status(200).json({ chapter });
  } catch (err) {
    console.error("Error fetching chapter:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllCoursesAdmin = async (req, res) => {
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