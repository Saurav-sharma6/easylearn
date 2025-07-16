const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");

router.post("/", enrollmentController.createEnrollment);
router.get("/user/:userId", enrollmentController.getUserEnrollments);

module.exports = router;