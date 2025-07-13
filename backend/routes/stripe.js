const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  const { courseId, courseName, price, userId } = req.body;

  try {
    // Validate input
    if (!courseId || !courseName || isNaN(price) || price < 0 || !userId) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Validate course and user
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ error: "Course or user not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ error: "User already enrolled in this course" });
    }

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: courseName },
            unit_amount: Math.round(price * 100), // Convert to cents, ensure integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { courseId, userId },
    });

    // Create a payment record
    await Payment.create({
      userId,
      courseId,
      instructorId: course.instructorId,
      stripeSessionId: session.id,
      amount: price,
      status: "pending",
      createdAt: new Date(),
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    res.status(500).json({ error: `Failed to create checkout session: ${err.message}` });
  }
});

// Confirm Payment and Enroll User
router.post("/confirm", async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Validate sessionId
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const payment = await Payment.findOne({ stripeSessionId: session.id });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (session.payment_status === "paid") {
      payment.status = "completed";
      await payment.save();

      // Create enrollment record
      const existingEnrollment = await Enrollment.findOne({
        userId: payment.userId,
        courseId: payment.courseId,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          userId: payment.userId,
          courseId: payment.courseId,
          paymentId: payment._id,
          enrolledAt: new Date(),
          status: "active",
        });
      }

      res.json({ message: "Payment confirmed and user enrolled" });
    } else {
      payment.status = "failed";
      await payment.save();
      res.status(400).json({ error: "Payment not completed" });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error.message);
    res.status(500).json({ error: `Failed to confirm payment: ${error.message}` });
  }
});

// Verify Payment Status
router.get("/verify/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const payment = await Payment.findOne({ stripeSessionId: session.id });

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    // If DB is out of sync with Stripe, update it
    if (session.payment_status === "paid" && payment.status !== "completed") {
      payment.status = "completed";
      await payment.save();

      // Create enrollment record if not exists
      const existingEnrollment = await Enrollment.findOne({
        userId: payment.userId,
        courseId: payment.courseId,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          userId: payment.userId,
          courseId: payment.courseId,
          paymentId: payment._id,
          enrolledAt: new Date(),
          status: "active",
        });
      }
    }

    res.json({
      status: session.payment_status,
      paymentStatus: payment.status,
      paid: session.payment_status === "paid",
    });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ error: `Verification error: ${err.message}` });
  }
});

module.exports = router;