const withdrawalService = require("../services/Withdrawal.service");

const createWithdrawal = async (req, res) => {
    try {
        const withdrawal = await withdrawalService.createWithdrawal(req.body);

        return res.status(201).json({
            success: true,
            message: "Withdrawal request created successfully.",
            data: withdrawal,
        });
    }

    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await withdrawalService.getAllWithdrawals();

        return res.status(200).json({
            success: true,
            count: withdrawals.length,
            data: withdrawals,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getWithdrawalById = async (req, res) => {
    try {
        const withdrawal = await withdrawalService.getWithdrawalById(req.params.id);

        return res.status(200).json({
            success: true,
            data: withdrawal,
        });
    }

    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getUserWithdrawals = async (req, res) => {
    try {
        const withdrawals = await withdrawalService.getUserWithdrawals(
            req.params.userId
        );

        return res.status(200).json({
            success: true,
            count: withdrawals.length,
            data: withdrawals,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Withdrawal Status (Admin)
const updateWithdrawalStatus = async (req, res) => {
    try {
        const withdrawal = await withdrawalService.updateWithdrawalStatus(
            req.params.id,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Withdrawal status updated successfully.",
            data: withdrawal,
        });
    }

    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const recoverFailedWithdrawal = async (req, res) => {
    try {
        const result = await withdrawalService.recoverFailedWithdrawal(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Withdrawal amount credited back successfully.",
            data: result,
        });
    }

    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { createWithdrawal, getAllWithdrawals, getWithdrawalById, getUserWithdrawals, updateWithdrawalStatus, recoverFailedWithdrawal, };