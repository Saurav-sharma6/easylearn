const Course = require("../models/Course");
const User = require("../models/User"); // Import User model to validate instructor
const Chapter = require("../models/Chapter");
const Lecture = require("../models/Lecture");


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

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).populate(
      "instructorId",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ course });
  } catch (err) {
    console.error("Failed to fetch course:", err);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};



// POST /api/courses - Create new course
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
      curriculum, // full array of chapters with lecture info
    } = req.body;

    // Validate required fields
    if (!title || !instructorId || !duration || !image) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ error: "Invalid instructorId" });
    }

    // Verify instructor exists and is of type 'instructor'
    const instructorUser = await User.findById(instructorId);
    if (!instructorUser || instructorUser.role !== "instructor") {
      return res
        .status(403)
        .json({ error: "Only instructors can create courses" });
    }

    // Handle lectures and chapters
    const chapterIds = [];

    for (const chapter of curriculum) {
      const lectureIds = [];

      // Create each lecture first
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

      // Then create the chapter with those lecture IDs
      const newChapter = new Chapter({
        chapterTitle: chapter.chapterTitle,
        chapterContent: lectureIds,
      });

      await newChapter.save();
      chapterIds.push(newChapter._id);
    }

    // Create course
    const course = new Course({
      title,
      description,
      instructor: instructorUser.name, // Use instructor name
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

    // Populate curriculum for response
    const populatedCourse = await Course.findById(course._id)
      .populate("instructorId", "name email")
      .populate({
        path: "curriculum",
        populate: {
          path: "chapterContent",
          model: "Lecture",
        },
      });

    res
      .status(201)
      .json({
        message: "Course created successfully",
        course: populatedCourse,
      });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: "Internal server error" });
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