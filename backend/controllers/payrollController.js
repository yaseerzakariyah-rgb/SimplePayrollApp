
const Employee = require("../models/Employee");
const Salary = require("../models/Salary");
const Deduction = require("../models/Deduction");
const Payroll = require("../models/Payroll");
const User = require("../models/User");

// Check pay period format and prevent future payroll months.
const getPayPeriodStatus = (value) => {
    const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(
        String(value || "").trim()
    );

    if (!match) return "invalid";

    const date = new Date(`${match[1]} 1, ${match[2]} 00:00:00`);

    if (Number.isNaN(date.getTime())) return "invalid";

    const fullMonth = date.toLocaleDateString("en-US", {
        month: "long"
    });

    if (fullMonth.toLowerCase() !== match[1].toLowerCase()) {
        return "invalid";
    }

    const now = new Date();

    if (
        date.getFullYear() > now.getFullYear() ||
        (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() > now.getMonth()
        )
    ) {
        return "future";
    }

    return "valid";
};

// Employee can view their own payroll records.
const getMyPayrolls = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        const employee = await Employee.findOne({
            email: user.email
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee record not found",
                data: null
            });
        }

        const payrolls = await Payroll.find({
            employee: employee._id
        })
            .populate(
                "employee",
                "name email department position"
            )
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            message: "Your payroll records retrieved successfully",
            data: payrolls
        });
    } catch (error) {
        console.error("Get my payrolls error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve your payroll records",
            data: null
        });
    }
};

// Admin processes payroll for an employee.
const runPayroll = async (req, res) => {
    try {
        const { employeeId, payPeriod } = req.body;

        if (!employeeId || !payPeriod) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and pay period are required",
                data: null
            });
        }

        const period = String(payPeriod).trim();
        const periodStatus = getPayPeriodStatus(period);

        if (periodStatus === "future") {
            return res.status(400).json({
                success: false,
                message: "Payroll cannot be processed for a future month.",
                data: null
            });
        }

        if (periodStatus === "invalid") {
            return res.status(400).json({
                success: false,
                message: "Pay period must use Month Year format, for example October 2026.",
                data: null
            });
        }

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null
            });
        }

        const salary = await Salary.findOne({
            employee: employeeId
        }).sort({ effectiveDate: -1 });

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: "Salary record not found",
                data: null
            });
        }

        const deductions = await Deduction.find({
            employee: employeeId
        });

        const totalDeductions = deductions.reduce(
            (total, item) => total + Number(item.amount || 0),
            0
        );

        const basicSalary = Number(salary.basicSalary || 0);
        const allowances = Number(salary.allowances || 0);
        const grossSalary = basicSalary + allowances;
        const netSalary = grossSalary - totalDeductions;

        const payroll = await Payroll.create({
            employee: employeeId,
            basicSalary,
            allowances,
            grossSalary,
            totalDeductions,
            netSalary,
            payPeriod: period,
            status: "processed"
        });

        return res.status(201).json({
            success: true,
            message: "Payroll processed successfully",
            data: payroll
        });
    } catch (error) {
        console.error("Run payroll error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process payroll",
            data: null
        });
    }
};

// Admin edits an existing payroll record.
const updatePayroll = async (req, res) => {
    try {
        const {
            payPeriod,
            basicSalary,
            allowances,
            totalDeductions
        } = req.body;

        if (!payPeriod) {
            return res.status(400).json({
                success: false,
                message: "Pay period is required",
                data: null
            });
        }

        const period = String(payPeriod).trim();
        const periodStatus = getPayPeriodStatus(period);

        if (periodStatus === "future") {
            return res.status(400).json({
                success: false,
                message: "Payroll cannot be changed to a future month.",
                data: null
            });
        }

        if (periodStatus === "invalid") {
            return res.status(400).json({
                success: false,
                message: "Pay period must use Month Year format, for example October 2026.",
                data: null
            });
        }

        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found",
                data: null
            });
        }

        const nextBasic = Number(basicSalary);
        const nextAllowances = Number(allowances);
        const nextDeductions = Number(totalDeductions);

        if (
            ![
                nextBasic,
                nextAllowances,
                nextDeductions
            ].every(Number.isFinite) ||
            nextBasic < 0 ||
            nextAllowances < 0 ||
            nextDeductions < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Salary, allowances, and deductions must be valid non-negative numbers.",
                data: null
            });
        }

        payroll.payPeriod = period;
        payroll.basicSalary = nextBasic;
        payroll.allowances = nextAllowances;
        payroll.grossSalary = nextBasic + nextAllowances;
        payroll.totalDeductions = nextDeductions;
        payroll.netSalary =
            payroll.grossSalary - nextDeductions;

        await payroll.save();

        await payroll.populate(
            "employee",
            "name email department position"
        );

        return res.json({
            success: true,
            message: "Payroll record updated successfully",
            data: payroll
        });
    } catch (error) {
        console.error("Update payroll error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update payroll record",
            data: null
        });
    }
};

// Admin can view all payroll records.
const getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find()
            .populate(
                "employee",
                "name email department position"
            )
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            message: "Payroll records retrieved successfully",
            data: payrolls
        });
    } catch (error) {
        console.error("Get payrolls error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve payroll records",
            data: null
        });
    }
};

const deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndDelete(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found",
                data: null
            });
        }

        return res.json({
            success: true,
            message: "Payroll record deleted successfully",
            data: payroll
        });
    } catch (error) {
        console.error("Delete payroll error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete payroll record",
            data: null
        });
    }
};

module.exports = {
    runPayroll,
    getPayrolls,
    getMyPayrolls,
    updatePayroll,
    deletePayroll
};
    