const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Monthly growth (completed payments in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const recentPayments = await Payment.find({ status: 'completed', createdAt: { $gte: thirtyDaysAgo } });
    const previousPayments = await Payment.find({ status: 'completed', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    const recentRevenue = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const previousRevenue = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const monthlyGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 100;

    res.json({
      totalUsers,
      totalCourses,
      totalRevenue,
      monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};