const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const User = require("../models/User");

// Get logged-in employee's salary records
const getMySalaries = async (req, res) => {
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

        const salaries = await Salary.find({
            employee: employee._id
        }).sort({ effectiveDate: -1 });

        res.json({
            success: true,
            message: "Your salary records retrieved successfully",
            data: salaries
        });

    } catch (error) {
        console.error("Get my salaries error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve your salary records",
            data: null
        });
    }
};

const createSalary = async (req, res) => {
    try {
        const {
            employee,
            basicSalary,
            allowances,
            effectiveDate
        } = req.body;

        if (!employee || basicSalary === undefined || !effectiveDate) {
            return res.status(400).json({
                success: false,
                message: "Employee, basic salary and effective date are required",
                data: null
            });
        }

        if (Number(basicSalary) < 0 || Number(allowances || 0) < 0) {
            return res.status(400).json({
                success: false,
                message: "Salary amounts cannot be negative",
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

        const salary = await Salary.create({
            employee,
            basicSalary,
            allowances: allowances || 0,
            effectiveDate
        });

        res.status(201).json({
            success: true,
            message: "Salary record created successfully",
            data: salary
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create salary record",
            data: null
        });
    }
};

const getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find()
            .populate("employee", "name email department position");

        res.json({
            success: true,
            message: "Salary records retrieved successfully",
            data: salaries
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to retrieve salary records",
            data: null
        });
    }
};

// Update salary
const updateSalary = async (req, res) => {
    try {
        const {
            employee,
            basicSalary,
            allowances,
            effectiveDate
        } = req.body;

        if (!employee || basicSalary === undefined || !effectiveDate) {
            return res.status(400).json({
                success: false,
                message: "Employee, basic salary and effective date are required",
                data: null
            });
        }

        if (Number(basicSalary) < 0 || Number(allowances || 0) < 0) {
            return res.status(400).json({
                success: false,
                message: "Salary amounts cannot be negative",
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

        const salary = await Salary.findById(req.params.id);

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: "Salary record not found",
                data: null
            });
        }

        salary.employee = employee;
        salary.basicSalary = basicSalary;
        salary.allowances = allowances || 0;
        salary.effectiveDate = effectiveDate;

        await salary.save();

        res.json({
            success: true,
            message: "Salary record updated successfully",
            data: salary
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update salary record",
            data: null
        });
    }
};

// Delete salary
const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: "Salary record not found",
                data: null
            });
        }

        await Salary.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Salary record deleted successfully",
            data: null
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete salary record",
            data: null
        });
    }
};

module.exports = {
    createSalary,
    getSalaries,
    getMySalaries,
    updateSalary,
    deleteSalary
};