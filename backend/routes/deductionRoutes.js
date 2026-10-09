
const express = require("express");

const {
    createDeduction,
    getDeductions,
    getMyDeductions,
    updateDeduction,
    deleteDeduction
} = require("../controllers/deductionController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin creates deduction
router.post(
    "/",
    protect,
    authorize("admin"),
    createDeduction
);

// Admin sees all deductions
router.get(
    "/",
    protect,
    authorize("admin"),
    getDeductions
);
// Employee sees ONLY their own deductions
router.get(
    "/me",
    protect,
    authorize("employee"),
    getMyDeductions
);

// Admin updates deduction
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateDeduction
);

// Admin deletes deduction
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteDeduction
);

module.exports = router;

