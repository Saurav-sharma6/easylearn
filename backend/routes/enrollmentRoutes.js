const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { authenticateToken, roleMiddleware } = require("../middleware/auth");

console.log('Imported enrollmentController:', enrollmentController);

router.post("/", [authenticateToken, roleMiddleware(['student'])], enrollmentController.createEnrollment);
router.get("/user/:userId", [authenticateToken, roleMiddleware(['student'])], enrollmentController.getUserEnrollments);
router.post("/complete", [authenticateToken, roleMiddleware(['student'])], enrollmentController.markCourseCompleted);

module.exports = router;