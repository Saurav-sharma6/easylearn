import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },         // Buyer
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // Seller
  stripeSessionId: String,
  amount: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.model("Payment", paymentSchema);