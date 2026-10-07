const User = require("../models/User");

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve users",
            data: null
        });
    }
};


// Change user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        if (!["admin", "employee"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
                data: null
            });
        }

        // Prevent admin from changing their own role
        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role",
                data: null
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        user.role = role;

        await user.save();

        res.json({
            success: true,
            message: `User role changed to ${role}`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Update user role error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update user role",
            data: null
        });
    }
};


module.exports = {
    getUsers,
    updateUserRole
};
