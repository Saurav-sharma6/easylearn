const express = require("express");
const Stripe = require("stripe");
const { Payment } = require("../models/Payments");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  const { courseId, courseName, price, userId } = req.body;

  try {
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: courseName },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { courseId, userId },
    });

    await Payment.create({
      userId,
      courseId,
      amount: price,
      status: "pending",
      sessionId: session.id,
      createdAt: new Date(),
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    res.status(500).json({ error: err.message });
  }
});

