const userService = require("../services/User.service");

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            data: user,
        });
    }
    
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } 
    
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: user,
        });
    } 
    
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });
    } 
    
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getUserBalance = async (req, res) => {
    try {
        const balance = await userService.getUserBalance(req.params.id);

        return res.status(200).json({
            success: true,
            withdrawableBalance: balance,
        });
    }
    
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserBalance, };