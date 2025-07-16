const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },         // Buyer
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // Seller
  stripeSessionId: {type: String, required: true},
  amount: {type: Number, required: true},
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);