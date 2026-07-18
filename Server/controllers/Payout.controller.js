const payoutService = require("../services/Payout.service");

// Run Advance Payout Job
const processAdvancePayout = async (req, res) => {
    try {
        const result = await payoutService.processAdvancePayout();

        return res.status(200).json({
            success: true,
            message: "Advance payout processed successfully.",
            data: result,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Process Final Payout After Reconciliation
const processFinalPayout = async (req, res) => {
    try {
        const result = await payoutService.processFinalPayout(req.params.saleId);

        return res.status(200).json({
            success: true,
            message: "Final payout processed successfully.",
            data: result,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Recover Failed / Cancelled / Rejected Payout
const recoverFailedPayout = async (req, res) => {
    try {
        const result = await payoutService.recoverFailedPayout(req.params.payoutId);

        return res.status(200).json({
            success: true,
            message: "Failed payout recovered successfully.",
            data: result,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Payout History By User
const getUserPayoutHistory = async (req, res) => {
    try {
        const payouts = await payoutService.getUserPayoutHistory(req.params.userId);

        return res.status(200).json({
            success: true,
            count: payouts.length,
            data: payouts,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Single Payout
const getPayoutById = async (req, res) => {
    try {
        const payout = await payoutService.getPayoutById(req.params.id);

        return res.status(200).json({
            success: true,
            data: payout,
        });
    }

    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { processAdvancePayout, processFinalPayout, recoverFailedPayout, getUserPayoutHistory, getPayoutById, };