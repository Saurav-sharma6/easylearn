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

// Webhook Handler - Now properly mounted at /api/payment/webhook
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Debug: Log received event
    console.log(`Received event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Debug: Log session details
      console.log(`Processing session: ${session.id}, Status: ${session.payment_status}`);
      
      if (session.payment_status !== 'paid') {
        console.log(`Payment not completed for session: ${session.id}`);
        return res.json({ received: true });
      }

      const updateResult = await Payment.updateOne(
        { sessionId: session.id },
        { 
          status: 'succeeded',
          paymentMethod: session.payment_method_types?.[0],
          stripeCustomerId: session.customer,
          updatedAt: new Date()
        }
      );
      
      // Debug: Log update result
      console.log(`Update result for ${session.id}:`, updateResult);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Verification Endpoint
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const payment = await Payment.findOne({ sessionId: session.id });
    
    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }
    
    // If DB is out of sync with Stripe, update it
    if (session.payment_status === 'paid' && payment.status !== 'succeeded') {
      await Payment.updateOne(
        { sessionId: session.id },
        { status: 'succeeded', updatedAt: new Date() }
      );
    }
    
    res.json({ 
      status: session.payment_status,
      paymentStatus: payment.status,
      paid: session.payment_status === 'paid'
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;