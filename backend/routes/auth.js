const express = require("express");
const { register, login } = require("../controllers/authController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const MenuItem = require("../models/MenuItems");
const User = require("../models/User");

const router = express.Router();

console.log("Auth routes initialized");
// Auth
router.post("/register", register);
router.post("/login", login);

// Protected Routes
router.get("/menu-item", authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  try {
      const items = await MenuItem.find();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Error fetching menu items", error: err.message });
    }

});

router.get("/get-profile", authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  try {
      const items = await MenuItem.find();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Error fetching menu items", error: err.message });
    }

});


router.post("/cart", authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    const item = await MenuItem.findById(menuItemId);
    if (!item) return res.status(404).json({ error: "Menu item not found" });

    const user = await User.findById(req.user.id);
    const cartItem = user.cart.find(
      c => c.menuItem.toString() === menuItemId
    );

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ menuItem: menuItemId, quantity });
    }

    await user.save();
    res.json({ message: "Item added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cart",authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("cart.menuItem");
  res.json(user.cart);
});




router.get("/admin-dashboard", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard 🛠" });
});

router.get("/delivery-dashboard", authMiddleware, roleMiddleware(["delivery"]), (req, res) => {
  res.json({ message: "Welcome to Delivery Dashboard 🚚" });
});

module.exports = router;
