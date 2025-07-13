const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const payment = await Payment.findOne({ stripeSessionId: session.id });

      if (!payment) {
        console.error(`Payment not found for session: ${session.id}`);
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
          console.log(`User ${payment.userId} enrolled in course ${payment.courseId}`);
        } else {
          console.warn(`User ${payment.userId} already enrolled in course ${payment.courseId}`);
        }
      } else {
        payment.status = "failed";
        await payment.save();
        console.warn(`Payment not completed for session: ${session.id}`);
      }
    } catch (err) {
      console.error("Webhook processing error:", err.message);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  res.json({ received: true });
});

module.exports = router;