const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { Payment } = require("../models/Payments");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use raw body for webhooks
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
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await Payment.findOneAndUpdate(
        { sessionId: session.id },
        { status: "paid" }
      );
      console.log("Payment status updated to 'paid'");
    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  }

  res.status(200).send("Webhook received");
});

module.exports = router;
