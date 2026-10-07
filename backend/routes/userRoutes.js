const express = require("express");

const {
    getUsers,
    updateUserRole
} = require("../controllers/userController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin only
router.get(
    "/",
    protect,
    authorize("admin"),
    getUsers
);

// Admin only
router.patch(
    "/:id/role",
    protect,
    authorize("admin"),
    updateUserRole
);

module.exports = router;
