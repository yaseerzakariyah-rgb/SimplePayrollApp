
const express = require("express");

const {
    runPayroll,
    getPayrolls,
    getMyPayrolls,
    updatePayroll,
    deletePayroll
} = require("../controllers/payrollController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin processes payroll
router.post(
    "/run",
    protect,
    authorize("admin"),
    runPayroll
);

// Admin sees ALL payroll records
router.get(
    "/",
    protect,
    authorize("admin"),
    getPayrolls
);

// Employee sees ONLY their own payroll
router.get(
    "/me",
    protect,
    authorize("employee"),
    getMyPayrolls
);

router.put("/:id", protect, authorize("admin"), updatePayroll);
router.delete("/:id", protect, authorize("admin"), deletePayroll);


module.exports = router;

