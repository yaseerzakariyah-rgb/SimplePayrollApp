const express = require("express");

const {
    getUsers,
    updateUserRole
} = require("../controllers/adminController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Only admins can view users
router.get(
    "/users",
    protect,
    authorize("admin"),
    getUsers
);

// Only admins can change user roles
router.put(
    "/users/:id/role",
    protect,
    authorize("admin"),
    updateUserRole
);

module.exports = router;
