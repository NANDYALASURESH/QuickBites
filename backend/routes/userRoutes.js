const express = require("express");
const User = require("../models/User");
const MenuItem = require("../models/MenuItems");
const Order = require("../models/Order");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);
router.use(roleMiddleware(["user"]));

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, address },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// Get all menu items
router.get("/menu-items", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching menu items", error: err.message });
  }
});

// Get menu item by ID
router.get("/menu-items/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching menu item", error: err.message });
  }
});

// Get cart
router.get("/cart", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.menuItem");
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});

// Add to cart
router.post("/cart", async (req, res) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    const item = await MenuItem.findById(menuItemId);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const user = await User.findById(req.user.id);
    const cartItem = user.cart.find(c => c.menuItem.toString() === menuItemId);

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ menuItem: menuItemId, quantity });
    }

    await user.save();
    const populatedUser = await User.findById(req.user.id).populate("cart.menuItem");
    res.json({ message: "Item added to cart", cart: populatedUser.cart });
  } catch (err) {
    res.status(500).json({ message: "Error adding to cart", error: err.message });
  }
});

// Update cart item quantity
router.put("/cart", async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await User.findById(req.user.id);
    const cartItem = user.cart.find(c => c.menuItem.toString() === menuItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    const populatedUser = await User.findById(req.user.id).populate("cart.menuItem");
    res.json({ message: "Cart updated", cart: populatedUser.cart });
  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err.message });
  }
});

// Remove item from cart
router.delete("/cart/:menuItemId", async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(c => c.menuItem.toString() !== menuItemId);
    await user.save();

    const populatedUser = await User.findById(req.user.id).populate("cart.menuItem");
    res.json({ message: "Item removed from cart", cart: populatedUser.cart });
  } catch (err) {
    res.status(500).json({ message: "Error removing from cart", error: err.message });
  }
});

// Clear cart
router.delete("/cart", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();
    res.json({ message: "Cart cleared", cart: [] });
  } catch (err) {
    res.status(500).json({ message: "Error clearing cart", error: err.message });
  }
});

// Create order
router.post("/orders", async (req, res) => {
  try {
    const { deliveryAddress, phone, paymentMethod, notes } = req.body;

    if (!deliveryAddress || !phone || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get user with cart
    const user = await User.findById(req.user.id).populate("cart.menuItem");
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = user.cart.map(item => {
      const itemTotal = item.menuItem.price * item.quantity;
      totalAmount += itemTotal;
      return {
        menuItem: item.menuItem._id,
        quantity: item.quantity,
        price: item.menuItem.price
      };
    });

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      phone,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
      notes
    });

    await order.save();

    // Clear user's cart
    user.cart = [];
    await user.save();

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('user', '-password');

    res.status(201).json({
      message: "Order placed successfully!",
      order: populatedOrder
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

// Get user's orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

// Get single order
router.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    }).populate('items.menuItem').populate('deliveryPerson', 'fullName phone');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
});

// Cancel order
router.put("/orders/:orderId/cancel", async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel order that is already ${order.orderStatus}` 
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling order", error: err.message });
  }
});

module.exports = router;