const User = require("../models/User");

const createUser = async (data) => {
    try {
        const { name, email } = data;

        if (!name || !email) {
            throw new Error("Name and Email are required.");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists with this email.");
        }

        const user = await User.create({
            name,
            email,
            withdrawableBalance: 0,
            totalAdvancePaid: 0,
            totalFinalPaid: 0,
            totalAdjustment: 0,
            lastWithdrawalAt: null,
        });

        return user;

    }

    catch (error) {
        throw error;
    }
};

const getAllUsers = async () => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return users;
    } 
    
    catch (error) {
        throw error;
    }
};

const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;
    } 
    
    catch (error) {
        throw error;
    }
};

const updateUser = async (userId, data) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        // Update only provided fields
        if (data.name) {
            user.name = data.name;
        }

        if (data.email) {

            // Check duplicate email
            const existingUser = await User.findOne({
                email: data.email,
                _id: { $ne: userId },
            });

            if (existingUser) {
                throw new Error("Email already exists.");
            }

            user.email = data.email;
        }

        await user.save();

        return user;
    } 
    
    catch (error) {
        throw error;
    }
};

const deleteUser = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        await User.findByIdAndDelete(userId);

        return {
            success: true,
            message: "User deleted successfully.",
        };
    } 
    
    catch (error) {
        throw error;
    }
};

const getUserBalance = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        return {
            userId: user._id,
            name: user.name,
            email: user.email,
            withdrawableBalance: user.withdrawableBalance,
            totalAdvancePaid: user.totalAdvancePaid,
            totalFinalPaid: user.totalFinalPaid,
            totalAdjustment: user.totalAdjustment,
            lastWithdrawalAt: user.lastWithdrawalAt,
        };

    }
    
    catch (error) {
        throw error;
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserBalance, };

