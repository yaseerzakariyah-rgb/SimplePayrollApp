const Deduction = require("../models/Deduction");
const Employee = require("../models/Employee");
const User = require("../models/User");
// Get logged-in employee's deductions
const getMyDeductions = async (req, res) => {
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

        const deductions = await Deduction.find({
            employee: employee._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Your deductions retrieved successfully",
            data: deductions
        });

    } catch (error) {
        console.error("Get my deductions error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve your deductions",
            data: null
        });
    }
};

// Create deduction
const createDeduction = async (req, res) => {
    try {
        const {
            employee,
            type,
            amount,
            description
        } = req.body;

        if (!employee || !type || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Employee, deduction type and amount are required",
                data: null
            });
        }

        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "Deduction amount cannot be negative",
                data: null
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null
            });
        }

        const deduction = await Deduction.create({
            employee,
            type,
            amount,
            description
        });

        res.status(201).json({
            success: true,
            message: "Deduction created successfully",
            data: deduction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create deduction",
            data: null
        });
    }
};

// Get all deductions
const getDeductions = async (req, res) => {
    try {
        const deductions = await Deduction.find()
            .populate("employee", "name email");

        res.json({
            success: true,
            message: "Deductions retrieved successfully",
            data: deductions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to retrieve deductions",
            data: null
        });
    }
};

// Update deduction
const updateDeduction = async (req, res) => {
    try {
        const {
            employee,
            type,
            amount,
            description
        } = req.body;

        if (!employee || !type || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Employee, deduction type and amount are required",
                data: null
            });
        }

        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "Deduction amount cannot be negative",
                data: null
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null
            });
        }

        const deduction = await Deduction.findById(req.params.id);

        if (!deduction) {
            return res.status(404).json({
                success: false,
                message: "Deduction not found",
                data: null
            });
        }

        deduction.employee = employee;
        deduction.type = type;
        deduction.amount = amount;
        deduction.description = description;

        await deduction.save();

        res.json({
            success: true,
            message: "Deduction updated successfully",
            data: deduction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update deduction",
            data: null
        });
    }
};

// Delete deduction
const deleteDeduction = async (req, res) => {
    try {
        const deduction = await Deduction.findById(req.params.id);

        if (!deduction) {
            return res.status(404).json({
                success: false,
                message: "Deduction not found",
                data: null
            });
        }

        await Deduction.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Deduction deleted successfully",
            data: null
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete deduction",
            data: null
        });
    }
};

module.exports = {
    createDeduction,
    getDeductions,
    getMyDeductions,
    updateDeduction,
    deleteDeduction
};