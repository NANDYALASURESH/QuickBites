const express = require("express");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// All delivery routes require authentication and delivery role
router.use(authMiddleware);
router.use(roleMiddleware(["delivery"]));

// Delivery dashboard
router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome to Delivery Dashboard 🚚" });
});

// Get assigned orders (placeholder - you'll need Order model)
router.get("/orders", async (req, res) => {
  try {
    // TODO: Implement order fetching logic when Order model is created
    res.json({ message: "Orders endpoint - Order model needed", orders: [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

// Update order status (placeholder)
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    // TODO: Implement order status update logic
    res.json({ message: "Order status updated", orderId: req.params.orderId, status });
  } catch (err) {
    res.status(500).json({ message: "Error updating order status", error: err.message });
  }
});

// Get delivery profile
router.get("/profile", async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

module.exports = router