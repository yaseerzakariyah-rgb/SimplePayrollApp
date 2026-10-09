const Employee = require("../models/Employee");
const User = require("../models/User");

// Create employee - ADMIN ONLY
const createEmployee = async (req, res) => {
    try {
        const { name, email, department, position, salary } = req.body;

        if (!name || !email || !department || !position || salary === undefined) {
            return res.status(400).json({
                success: false,
                message: "All employee fields are required",
                data: null
            });
        }

        if (Number(salary) < 0) {
            return res.status(400).json({
                success: false,
                message: "Salary cannot be negative",
                data: null
            });
        }

        const existingEmployee = await Employee.findOne({ email });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee already exists",
                data: null
            });
        }
const linkedUser = await User.findOne({
    email: email.trim().toLowerCase()
});

if (!linkedUser) {
    return res.status(404).json({
        success: false,
        message: "Create a user account with this email first.",
        data: null
    });
}

        const employee = await Employee.create({
            user: linkedUser._id,
            name,
            email: email.trim().toLowerCase(),
            department,
            position,
            salary
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee
        });

    } catch (error) {
        console.error("Create employee error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create employee",
            data: null
        });
    }
};


// Get all employees - ADMIN ONLY
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();

        res.json({
            success: true,
            message: "Employees retrieved successfully",
            data: employees
        });

    } catch (error) {
        console.error("Get employees error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve employees",
            data: null
        });
    }
};


// Get logged-in employee's own details
const getMyEmployee = async (req, res) => {
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

        res.json({
            success: true,
            message: "Employee details retrieved successfully",
            data: employee
        });

    } catch (error) {
        console.error("Get my employee error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve employee details",
            data: null
        });
    }
};


// Update employee - ADMIN ONLY
const updateEmployee = async (req, res) => {
    try {
        const { name, email, department, position, salary } = req.body;

        if (!name || !email || !department || !position || salary === undefined) {
            return res.status(400).json({
                success: false,
                message: "All employee fields are required",
                data: null
            });
        }

        if (Number(salary) < 0) {
            return res.status(400).json({
                success: false,
                message: "Salary cannot be negative",
                data: null
            });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null
            });
        }

        employee.name = name;
        employee.email = email;
        employee.department = department;
        employee.position = position;
        employee.salary = salary;

        await employee.save();

        res.json({
            success: true,
            message: "Employee updated successfully",
            data: employee
        });

    } catch (error) {
        console.error("Update employee error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update employee",
            data: null
        });
    }
};


// Delete employee - ADMIN ONLY
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null
            });
        }

        await Employee.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Employee deleted successfully",
            data: null
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to delete employee",
            data: null
        });
    }
};


module.exports = {
    createEmployee,
    getEmployees,
    getMyEmployee,
    updateEmployee,
    deleteEmployee
};