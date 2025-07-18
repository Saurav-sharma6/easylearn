const Course = require('../models/Course');
const User = require('../models/User');
const Lecture = require('../models/Lecture');
const Chapter = require('../models/Chapter');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose');

// POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      instructorId,
      instructor,
      price,
      originalPrice,
      duration,
      image,
      category,
      level,
      whatWillLearn,
      isFeatured,
      isPopular,
      curriculum,
    } = req.body;

    if (!instructorId || !mongoose.isValidObjectId(instructorId)) {
      return res.status(400).json({ error: "Invalid instructor ID" });
    }

    const parsedCurriculum = JSON.parse(curriculum || "[]");
    const files = req.files ? (Array.isArray(req.files.lectureVideos) ? req.files.lectureVideos : [req.files.lectureVideos]) : [];

    let expectedVideos = 0;
    parsedCurriculum.forEach((chapter) => {
      expectedVideos += chapter.chapterContent.length;
    });

    if (files.length !== expectedVideos) {
      return res.status(400).json({
        error: `Expected ${expectedVideos} video files, but received ${files.length}`,
      });
    }

    let fileIndex = 0;
    const newChapters = [];
    for (const chapter of parsedCurriculum) {
      const lectureIds = [];
      for (const lecture of chapter.chapterContent) {
        const file = files[fileIndex];
        if (!file) {
          return res.status(400).json({ error: "Missing video file for lecture" });
        }
        try {
          const uploadResult = await cloudinary.uploader.upload_stream(
            { resource_type: "video", folder: "easylearn/lectures" },
            (error, result) => {
              if (error) throw error;
              return result;
            }
          ).end(file.buffer);
          const lectureUrl = uploadResult.secure_url;
          fileIndex++;

          const newLecture = new Lecture({
            lectureTitle: lecture.lectureTitle,
            lectureDuration: lecture.lectureDuration,
            lectureUrl,
            isPreviewFree: lecture.isPreviewFree || false,
          });
          await newLecture.save();
          lectureIds.push(newLecture._id);
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Failed to upload video to Cloudinary" });
        }
      }

      const newChapter = new Chapter({
        chapterTitle: chapter.chapterTitle,
        chapterContent: lectureIds,
      });
      await newChapter.save();
      newChapters.push(newChapter._id);
    }

    const newCourse = new Course({
      title,
      description,
      instructor,
      instructorId,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      duration,
      image: image || "/placeholder.svg",
      category,
      level,
      whatWillLearn: JSON.parse(whatWillLearn || "[]"),
      isFeatured: isFeatured === "true",
      isPopular: isPopular === "true",
      curriculum: newChapters,
    });

    await newCourse.save();
    res.status(201).json({ course: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
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
    const {
      title,
      description,
      instructorId,
      instructor,
      price,
      originalPrice,
      duration,
      image,
      category,
      level,
      whatWillLearn,
      isFeatured,
      isPopular,
      curriculum,
    } = req.body;

    console.log("Received courseId:", courseId);
    console.log("Received instructorId:", instructorId);
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    if (!instructorId || !mongoose.isValidObjectId(instructorId)) {
      return res.status(400).json({ error: "Invalid instructor ID" });
    }

    const parsedCurriculum = JSON.parse(curriculum || "[]");
    console.log("Parsed curriculum:", parsedCurriculum);
    const files = req.files ? (Array.isArray(req.files) ? req.files : req.files.lectureVideos || []) : [];
    console.log("FILES:", files);

    const existingCourse = await Course.findById(courseId).populate({
      path: "curriculum",
      populate: { path: "chapterContent" },
    });
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    const newChapters = [];
    let fileIndex = 0;
    for (const chapter of parsedCurriculum) {
      const lectureIds = [];
      for (const lecture of chapter.chapterContent) {
        let lectureUrl = lecture.lectureUrl;
        let lectureId = lecture._id;

        if (lecture.videoFile === true) {
          if (fileIndex >= files.length) {
            console.warn(`No file provided for lecture: ${lecture.lectureTitle}, preserving existing URL if available`);
            if (lectureId && lectureUrl) {
              const existingLecture = await Lecture.findById(lectureId);
              if (existingLecture && existingLecture.lectureUrl) {
                lectureUrl = existingLecture.lectureUrl;
              } else {
                return res.status(400).json({ error: `Missing video file for new lecture: ${lecture.lectureTitle}` });
              }
            } else {
              return res.status(400).json({ error: `Missing video file for new lecture: ${lecture.lectureTitle}` });
            }
          } else {
            const file = files[fileIndex];
            try {
              if (lectureUrl && lectureId) {
                const publicId = lectureUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
                if (publicId) {
                  await cloudinary.uploader.destroy(`easylearn/lectures/${publicId}`, { resource_type: "video" });
                }
              }
              const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                  { resource_type: "video", folder: "easylearn/lectures" },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                  }
                ).end(file.buffer);
              });
              lectureUrl = uploadResult.secure_url;
              fileIndex++;
            } catch (error) {
              console.error("Cloudinary upload error:", error);
              return res.status(500).json({ error: "Failed to upload video to Cloudinary" });
            }
          }
        }

        const lectureData = {
          lectureTitle: lecture.lectureTitle,
          lectureDuration: lecture.lectureDuration,
          lectureUrl: lectureUrl || (lectureId ? (await Lecture.findById(lectureId))?.lectureUrl : ''),
          isPreviewFree: lecture.isPreviewFree || false,
        };

        const newLecture = lectureId
          ? await Lecture.findByIdAndUpdate(lectureId, lectureData, { new: true })
          : new Lecture(lectureData);

        if (!lectureId) {
          await newLecture.save();
        }
        lectureIds.push(newLecture._id);
      }

      const chapterData = {
        chapterTitle: chapter.chapterTitle,
        chapterContent: lectureIds,
      };

      const newChapter = chapter._id && mongoose.isValidObjectId(chapter._id)
        ? await Chapter.findByIdAndUpdate(chapter._id, chapterData, { new: true })
        : new Chapter(chapterData);

      if (!chapter._id) {
        await newChapter.save();
      }
      newChapters.push(newChapter._id);
    }

    // Only delete old chapters/lectures if curriculum IDs have changed
    const existingChapterIds = existingCourse.curriculum.map(ch => ch._id.toString());
    const newChapterIds = newChapters.map(id => id.toString());
    if (JSON.stringify(existingChapterIds) !== JSON.stringify(newChapterIds)) {
      for (const chapterId of existingCourse.curriculum) {
        if (!newChapterIds.includes(chapterId._id.toString())) {
          const chapter = await Chapter.findById(chapterId);
          if (chapter) {
            for (const lectureId of chapter.chapterContent) {
              const lecture = await Lecture.findById(lectureId);
              if (lecture && lecture.lectureUrl) {
                const publicId = lecture.lectureUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
                if (publicId) {
                  await cloudinary.uploader.destroy(`easylearn/lectures/${publicId}`, { resource_type: "video" });
                }
              }
              await Lecture.findByIdAndDelete(lectureId);
            }
            await Chapter.findByIdAndDelete(chapterId);
          }
        }
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        instructor,
        instructorId,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        duration,
        image: image || "/placeholder.svg",
        category,
        level,
        whatWillLearn: JSON.parse(whatWillLearn || "[]"),
        isFeatured: isFeatured === "true",
        isPopular: isPopular === "true",
        curriculum: newChapters,
      },
      { new: true }
    ).populate({
      path: "curriculum",
      populate: { path: "chapterContent" },
    });

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

// PATCH /api/lectures/:lectureId/video
exports.updateLectureVideo = async (req, res) => {
  try {
    const { lectureId } = req.params;
    console.log("Received lectureId:", lectureId);
    if (!mongoose.isValidObjectId(lectureId)) {
      return res.status(400).json({ error: "Invalid lecture ID" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }
    console.log("File received:", file.originalname, file.mimetype);

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    // Delete existing video if it exists
    if (lecture.lectureUrl) {
      const publicId = lecture.lectureUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`easylearn/lectures/${publicId}`, { resource_type: "video" });
          console.log("Deleted existing Cloudinary video:", publicId);
        } catch (error) {
          console.error("Error deleting existing Cloudinary video:", error);
        }
      }
    }

    // Upload new video to Cloudinary
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "easylearn/lectures" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(file.buffer);
      });

      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error("Cloudinary upload failed: No secure_url in response");
      }

      lecture.lectureUrl = uploadResult.secure_url;
      await lecture.save();
      console.log("Lecture updated with new URL:", lecture.lectureUrl);
      res.status(200).json({ lecture });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({ error: "Failed to upload video to Cloudinary" });
    }
  } catch (error) {
    console.error("Error updating lecture video:", error);
    res.status(500).json({ error: "Failed to update lecture video" });
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId).populate({
      path: 'curriculum',
      populate: { path: 'chapterContent', model: 'Lecture' },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete associated lectures and chapters
    for (const chapter of course.curriculum) {
      for (const lecture of chapter.chapterContent) {
        const publicId = lecture.lectureUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
        if (publicId) {
          await cloudinary.uploader.destroy(`easylearn/lectures/${publicId}`, { resource_type: "video" });
        }
        await Lecture.findByIdAndDelete(lecture._id);
      }
      await Chapter.findByIdAndDelete(chapter._id);
    }

    await Course.findByIdAndDelete(courseId);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/courses/instructor/:instructorId
exports.getCoursesByInstructorId = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      console.error('[getCoursesByInstructorId] Invalid instructor ID:', instructorId);
      return res.status(400).json({ error: 'Invalid instructor ID' });
    }

    const courses = await Course.find({ instructorId })
      .populate('instructorId', 'name email')
      .populate({
        path: 'curriculum',
        model: 'Chapter',
        populate: { path: 'chapterContent', model: 'Lecture' },
      });
      
    console.log(JSON.stringify(courses, null, 2)); 
    res.json({ courses });
  } catch (err) {
    console.error('[getCoursesByInstructorId] Error fetching instructor courses:', err.message || err);
    res.status(500).json({ error: 'Internal server error' });
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

// Save lesson progress
exports.updateProgress = async (req, res) => {
  const { courseId, lessonId, userId, progress, completed } = req.body;

  try {
    // Validate inputs
    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ error: "userId, courseId, and lessonId are required" });
    }
    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid userId, courseId, or lessonId" });
    }

    // Find course and populate curriculum
    const course = await Course.findById(courseId).populate({
      path: "curriculum",
      populate: { path: "chapterContent" },
    });
    if (!course || !course.curriculum) {
      return res.status(404).json({ error: "Course not found or invalid curriculum" });
    }

    // Log curriculum for debugging
    // console.log('Course curriculum:', JSON.stringify(course.curriculum, null, 2));

    // Validate lessonId exists in course
    const lessonExists = course.curriculum.some((chapter) =>
      Array.isArray(chapter.chapterContent) && chapter.chapterContent.some((lecture) => {
        const lectureId = lecture._id ? lecture._id.toString() : null;
        console.log(`Checking lecture ID: ${lectureId} against lessonId: ${lessonId}`);
        return lectureId === lessonId;
      })
    );
    if (!lessonExists) {
      console.error(`Lesson ID ${lessonId} not found in course ${courseId}`);
      return res.status(404).json({ error: "Lesson not found in course" });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({ error: "User not enrolled in this course" });
    }

    // Save progress
    let progressRecord = await Progress.findOne({ userId, courseId, lessonId });
    if (!progressRecord) {
      progressRecord = new Progress({
        userId,
        courseId,
        lessonId,
        progress: Number(progress) || 0,
        completed: !!completed,
        lastUpdated: new Date(),
      });
    } else {
      progressRecord.progress = Number(progress) || 0;
      progressRecord.completed = !!completed;
      progressRecord.lastUpdated = new Date();
    }
    await progressRecord.save();
    console.log('Progress record saved:', progressRecord);

    // Calculate course progress
    const allProgress = await Progress.find({ userId, courseId });
    const totalLessons = course.curriculum.reduce(
      (total, chapter) => total + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0),
      0
    );
    const completedLessons = allProgress.filter((p) => p.completed).length;
    const watchedDuration = allProgress.reduce((total, p) => total + (Number(p.progress) || 0), 0);
    const totalDuration = course.curriculum.reduce(
      (total, chapter) =>
        total +
        (Array.isArray(chapter.chapterContent)
          ? chapter.chapterContent.reduce(
              (sum, lecture) => sum + (parseFloat(lecture.lectureDuration) || 0) * 60,
              0
            )
          : 0),
      0
    );

    const courseProgress = {
      watchedDuration,
      percentageCompleted: totalLessons ? (completedLessons / totalLessons) * 100 : 0,
      status: completedLessons === totalLessons && totalLessons > 0 ? "completed" : "started",
      totalDuration,
    };
    // console.log('Calculated courseProgress:', { totalLessons, completedLessons, percentageCompleted: courseProgress.percentageCompleted });

    // Update enrollment status
    try {
      if (courseProgress.status === "completed") {
        await Enrollment.findOneAndUpdate(
          { userId, courseId },
          { status: "completed" },
          { upsert: true }
        );
      }
    } catch (enrollmentError) {
      console.error("Error updating enrollment:", enrollmentError.message);
    }

    res.json({ progress: allProgress, courseProgress, isCourseCompleted: courseProgress.status === "completed" });
  } catch (error) {
    console.error("Error updating progress:", error.message);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// Fetch user progress for a course
exports.getUserProgress = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    // Validate inputs
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid userId or courseId" });
    }

    const course = await Course.findById(courseId).populate({
      path: "curriculum",
      populate: { path: "chapterContent" },
    });
    if (!course || !Array.isArray(course.curriculum)) {
      return res.status(404).json({ error: "Course not found or invalid curriculum" });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({ error: "User not enrolled in this course" });
    }

    const progress = await Progress.find({ userId, courseId });
    const totalLessons = course.curriculum.reduce(
      (total, chapter) => total + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0),
      0
    );
    const completedLessons = progress.filter((p) => p.completed).length;
    const watchedDuration = progress.reduce((total, p) => total + (Number(p.progress) || 0), 0);
    const totalDuration = course.curriculum.reduce(
      (total, chapter) =>
        total +
        (Array.isArray(chapter.chapterContent)
          ? chapter.chapterContent.reduce(
              (sum, lecture) => sum + (parseFloat(lecture.lectureDuration) || 0) * 60,
              0
            )
          : 0),
      0
    );

    const courseProgress = {
      watchedDuration,
      percentageCompleted: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      status: completedLessons === totalLessons && totalLessons > 0 ? "completed" : "started",
      totalDuration,
    };
    console.log('Fetched courseProgress:', { totalLessons, completedLessons, percentageCompleted: courseProgress.percentageCompleted });

    res.json({ progress, courseProgress });
  } catch (error) {
    console.error("Error fetching progress:", error.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

