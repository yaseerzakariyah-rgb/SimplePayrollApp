
const express = require("express");

const {
    createSalary,
    getSalaries,
    getMySalaries,
    updateSalary,
    deleteSalary
} = require("../controllers/salaryController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin manages all salaries
router.post(
    "/",
    protect,
    authorize("admin"),
    createSalary
);

router.get(
    "/",
    protect,
    authorize("admin"),
    getSalaries
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateSalary
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteSalary
);

// Employee sees ONLY their own salary
router.get(
    "/me",
    protect,
    authorize("employee"),
    getMySalaries
);

module.exports = router;

