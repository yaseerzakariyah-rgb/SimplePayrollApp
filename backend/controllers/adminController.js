const User = require("../models/User");

// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch users"
        });
    }
};


// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["admin", "employee"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Update user role error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update user role"
        });
    }
};

module.exports = {
    getUsers,
    updateUserRole
};