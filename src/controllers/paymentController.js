const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const User = require("../models/User");

// Create a payment (User)
exports.createPayment = async (req, res) => {
  try {
    const { rentalId, amount, method, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!rentalId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Rental ID, amount, and payment method are required",
      });
    }

    // Verify rental exists and belongs to user (or user is admin)
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Check if user owns the rental or is admin
    if (req.user.role !== "admin" && rental.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only make payments for your own rentals",
      });
    }

    // Create payment
    const payment = await Payment.create({
      rentalId,
      userId: rental.userId, // Use rental's userId to ensure consistency
      amount,
      method,
      notes,
      status: method === "cash" ? "pending" : "completed",
      processedAt: method === "cash" ? null : new Date(),
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate("rentalId", "equipmentId startDate endDate totalCost")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: {
        id: populatedPayment._id,
        rentalId: populatedPayment.rentalId?._id,
        amount: populatedPayment.amount,
        method: populatedPayment.method,
        status: populatedPayment.status,
        notes: populatedPayment.notes,
        createdAt: populatedPayment.createdAt,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Get payments (User gets own, Admin gets all)
exports.getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Build query based on role
    const query = isAdmin ? {} : { userId };

    const payments = await Payment.find(query)
      .populate("rentalId", "equipmentId startDate endDate totalCost status")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments.map((payment) => ({
        id: payment._id,
        rentalId: payment.rentalId?._id,
        userId: payment.userId?._id,
        userName: payment.userId?.name,
        userEmail: payment.userId?.email,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        processedAt: payment.processedAt,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const payment = await Payment.findById(id)
      .populate("rentalId", "equipmentId startDate endDate totalCost status")
      .populate("userId", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check ownership
    if (!isAdmin && payment.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own payments",
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        rentalId: payment.rentalId?._id,
        userId: payment.userId?._id,
        userName: payment.userId?.name,
        userEmail: payment.userId?.email,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        notes: payment.notes,
        processedAt: payment.processedAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// Update payment status (Admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const update = { status };
    if (status === "completed" && !transactionId) {
      update.processedAt = new Date();
    }
    if (transactionId) {
      update.transactionId = transactionId;
    }

    const payment = await Payment.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        transactionId: payment.transactionId,
        processedAt: payment.processedAt,
      },
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
};
