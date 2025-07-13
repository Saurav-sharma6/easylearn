const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const createEnrollment = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ error: "User ID and Course ID are required" });
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const enrollments = await Enrollment.find({ userId });
    res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments error:", error.message);
    res.status(500).json({ error: `Failed to fetch enrollments: ${error.message}` });
  }
};

module.exports = { createEnrollment, getUserEnrollments };