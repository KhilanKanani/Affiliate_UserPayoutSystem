const mongoose = require("mongoose");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");

const createWithdrawal = async (data) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, amount } = data;

        // Check required fields
        if (!userId || !amount) {
            throw new Error("User ID and amount are required.");
        }

        // Amount should be greater than zero
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be greater than zero.");
        }

        // Find User
        const user = await User.findById(userId).session(session);

        if (!user) {
            throw new Error("User not found.");
        }

        // Check 24-hour withdrawal rule
        if (user.lastWithdrawalAt) {
            const currentTime = new Date();
            const lastWithdrawal = new Date(user.lastWithdrawalAt);
            const difference = currentTime.getTime() - lastWithdrawal.getTime();
            const hours = difference / (1000 * 60 * 60);

            if (hours < 24) {
                throw new Error(
                    "You can withdraw only once every 24 hours."
                );
            }
        }

        // Check user balance
        if (user.withdrawableBalance < amount) {
            throw new Error("Insufficient withdrawable balance.");
        }

        // Deduct balance
        user.withdrawableBalance -= amount;
        // Update last withdrawal time
        user.lastWithdrawalAt = new Date();
        await user.save({ session });

        // Create withdrawal request
        const withdrawal = await Withdrawal.create(
            [
                {
                    userId,
                    amount,
                    status: "PENDING",
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        return withdrawal[0];
    }

    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getAllWithdrawals = async () => {
    try {
        const withdrawals = await Withdrawal.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        return withdrawals;
    }

    catch (error) {
        throw error;
    }
};

const getWithdrawalById = async (withdrawalId) => {
    try {
        const withdrawal = await Withdrawal.findById(withdrawalId)
            .populate("userId", "name email");

        if (!withdrawal) {
            throw new Error("Withdrawal not found.");
        }

        return withdrawal;
    }

    catch (error) {
        throw error;
    }
};

const getUserWithdrawals = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        // Fetch User Withdrawals
        const withdrawals = await Withdrawal.find({
            userId: userId,
        }).sort({ createdAt: -1 });

        return withdrawals;
    } catch (error) {
        throw error;
    }
};

const updateWithdrawalStatus = async (withdrawalId, status) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const validStatus = [
            "PENDING",
            "SUCCESS",
            "FAILED",
            "REJECTED",
            "CANCELLED",
        ];

        if (!validStatus.includes(status)) {
            throw new Error("Invalid withdrawal status.");
        }

        const withdrawal = await Withdrawal.findById(withdrawalId).session(session);

        if (!withdrawal) {
            throw new Error("Withdrawal not found.");
        }

        withdrawal.status = status;
        await withdrawal.save({ session });
        await session.commitTransaction();
        session.endSession();
        return withdrawal;
    }

    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

//  Recover Failed Withdrawal
const recoverFailedWithdrawal = async (withdrawalId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const withdrawal = await Withdrawal.findById(withdrawalId).session(session);

        if (!withdrawal) {
            throw new Error("Withdrawal not found.");
        }

        if (withdrawal.status !== "FAILED" && withdrawal.status !== "REJECTED" && withdrawal.status !== "CANCELLED") {
            throw new Error(
                "Only FAILED, REJECTED or CANCELLED withdrawals can be recovered."
            );
        }

        const user = await User.findById(withdrawal.userId).session(session);

        if (!user) {
            throw new Error("User not found.");
        }

        // Credit amount back to user balance
        user.withdrawableBalance += withdrawal.amount;
        await user.save({ session });
        withdrawal.failureReason = "Recovered Successfully";
        await withdrawal.save({ session });
        await session.commitTransaction();
        session.endSession();

        return {
            withdrawal,
            userBalance: user.withdrawableBalance,
        };
    }

    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

module.exports = { createWithdrawal, getAllWithdrawals, getWithdrawalById, getUserWithdrawals, updateWithdrawalStatus, recoverFailedWithdrawal, };