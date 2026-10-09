
const express = require("express");

const {
    createEmployee,
    getEmployees,
    getMyEmployee,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee sees ONLY their own employee details
router.get(
    "/me",
    protect,
    authorize("employee"),
    getMyEmployee
);

// Admin sees ALL employees
router.get(
    "/",
    protect,
    authorize("admin"),
    getEmployees
);

// Admin creates employee
router.post(
    "/",
    protect,
    authorize("admin"),
    createEmployee
);

// Admin updates employee
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateEmployee
);

// Admin deletes employee
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteEmployee
);

module.exports = router;

