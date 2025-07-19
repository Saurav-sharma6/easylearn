const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const mongoose = require('mongoose');

const createEnrollment = async (req, res) => {
  const { userId, courseId, paymentId } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ error: "User ID and Course ID are required" });
    }

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid User ID or Course ID" });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ error: "User or course not found" });
    }

    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ error: "User already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentId: paymentId || null,
      enrolledAt: new Date(),
      status: "active",
    });

    res.json({ message: "Enrollment successful", enrollment });
  } catch (error) {
    console.error("Enrollment error:", error.message);
    res.status(500).json({ error: `Failed to enroll: ${error.message}` });
  }
};

const getUserEnrollments = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const enrollments = await Enrollment.find({ userId }).lean();
    res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments error:", error.message);
    res.status(500).json({ error: `Failed to fetch enrollments: ${error.message}` });
  }
};

const markCourseCompleted = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ error: "User ID and Course ID are required" });
    }

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid User ID or Course ID" });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.status = "completed";
    enrollment.completedAt = new Date();
    await enrollment.save();

    res.json({ message: "Course marked as completed", enrollment });
  } catch (error) {
    console.error("Mark course completed error:", error.message);
    res.status(500).json({ error: `Failed to mark course as completed: ${error.message}` });
  }
};

console.log('Exporting enrollmentController:', { createEnrollment, getUserEnrollments, markCourseCompleted });

module.exports = { createEnrollment, getUserEnrollments, markCourseCompleted };