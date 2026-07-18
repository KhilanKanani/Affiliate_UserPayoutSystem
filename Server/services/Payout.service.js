const mongoose = require("mongoose");
const User = require("../models/User");
const Sale = require("../models/Sale");
const Payout = require("../models/Payout");

const processAdvancePayout = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // Find all eligible pending sales
        const pendingSales = await Sale.find({
            status: "pending",
            advanceTransferred: false,
        }).session(session);

        if (pendingSales.length === 0) {
            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                message: "No eligible pending sales found.",
                processedSales: 0,
            };
        }

        let processedSales = 0;

        for (const sale of pendingSales) {

            // Calculate 10% advance
            const advanceAmount = Number(
                (sale.earning * 0.10).toFixed(2)
            );

            // Find User
            const user = await User.findById(sale.userId).session(session);

            if (!user) {
                continue;
            }

            // Update User Balance
            user.withdrawableBalance += advanceAmount;
            user.totalAdvancePaid += advanceAmount;
            await user.save({ session });

            // Create Payout Record
            await Payout.create(
                [
                    {
                        userId: sale.userId,
                        saleId: sale._id,
                        type: "ADVANCE",
                        amount: advanceAmount,
                        status: "SUCCESS",
                    },
                ],
                { session }
            );

            // Update Sale
            sale.advancePaid = advanceAmount;
            sale.advanceTransferred = true;
            await sale.save({ session });
            processedSales++;
        }

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Advance payout processed successfully.",
            processedSales,
        };
    }

    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const processFinalPayout = async (saleId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find Sale
        const sale = await Sale.findById(saleId).session(session);

        if (!sale) {
            throw new Error("Sale not found.");
        }

        // Sale must be reconciled first
        if (sale.status === "pending") {
            throw new Error(
                "Sale is still pending. Reconcile the sale first."
            );
        }

        // Find User
        const user = await User.findById(sale.userId).session(session);

        if (!user) {
            throw new Error("User not found.");
        }

        let payoutType = "";
        let payoutAmount = 0;

        // APPROVED SALE
        if (sale.status === "approved") {
            payoutType = "FINAL";
            payoutAmount = sale.earning - sale.advancePaid;
            user.withdrawableBalance += payoutAmount;
            user.totalFinalPaid += payoutAmount;
        }

        // REJECTED SALE
        else if (sale.status === "rejected") {
            payoutType = "ADJUSTMENT";
            payoutAmount = -sale.advancePaid;
            user.totalAdjustment += Math.abs(payoutAmount);

            // Deduct only if balance is available
            if (user.withdrawableBalance >= Math.abs(payoutAmount)) {
                user.withdrawableBalance -= Math.abs(payoutAmount);
            } else {
                user.withdrawableBalance = 0;
            }
        }

        await user.save({ session });

        // Create payout record
        await Payout.create(
            [
                {
                    userId: sale.userId,
                    saleId: sale._id,
                    type: payoutType,
                    amount: payoutAmount,
                    status: "SUCCESS",
                },
            ],
            { session }
        );

        sale.reconciledAt = new Date();
        await sale.save({ session });
        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            payoutType,
            payoutAmount,
            currentBalance: user.withdrawableBalance,
        };
    }

    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Recover Failed / Cancelled / Rejected Payout
const recoverFailedPayout = async (payoutId) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        const payout = await Payout.findById(payoutId).session(session);

        if (!payout) {
            throw new Error("Payout not found.");
        }

        // Only failed payouts can be recovered
        if (payout.status !== "FAILED" && payout.status !== "CANCELLED" && payout.status !== "REJECTED") {
            throw new Error(
                "Only FAILED, CANCELLED or REJECTED payouts can be recovered."
            );
        }

        // Find User
        const user = await User.findById(payout.userId).session(session);

        if (!user) {
            throw new Error("User not found.");
        }

        // Credit amount back
        user.withdrawableBalance += Math.abs(payout.amount);
        await user.save({ session });

        // Update payout status
        payout.status = "SUCCESS";
        await payout.save({ session });
        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Payout recovered successfully.",
            currentBalance: user.withdrawableBalance,
        };

    }

    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getUserPayoutHistory = async (userId) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        const payouts = await Payout.find({ userId: userId, }).sort({ createdAt: -1 });
        return payouts;
    }

    catch (error) {
        throw error;
    }
};

const getPayoutById = async (payoutId) => {
    try {

        const payout = await Payout.findById(payoutId)
            .populate("userId", "name email")
            .populate("saleId");

        if (!payout) {
            throw new Error("Payout not found.");
        }

        return payout;
    }

    catch (error) {
        throw error;
    }
};

module.exports = { processAdvancePayout, processFinalPayout, recoverFailedPayout, getUserPayoutHistory, getPayoutById, };

