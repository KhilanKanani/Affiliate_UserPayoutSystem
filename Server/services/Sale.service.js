const User = require("../models/User");
const Sale = require("../models/Sale");
const mongoose = require("mongoose");
const payoutService = require("./payout.service");

const createSale = async (data) => {
    try {
        const { userId, brand, earning } = data;

        if (!userId || !brand || !earning) {
            throw new Error(
                "User ID, Brand and Earning are required."
            );
        }

        if (earning <= 0) {
            throw new Error(
                "Earning must be greater than zero."
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        const sale = await Sale.create({
            userId,
            brand,
            earning,
            status: "pending",
            advancePaid: 0,
            advanceTransferred: false,
            reconciledAt: null,
        });

        return sale;
    }

    catch (error) {
        throw error;
    }
};

const getAllSales = async () => {
    try {

        const sales = await Sale.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        return sales;
    }

    catch (error) {
        throw error;
    }
};

const getSaleById = async (saleId) => {
    try {
        const sale = await Sale.findById(saleId).populate("userId", "name email");

        if (!sale) {
            throw new Error("Sale not found.");
        }

        return sale;
    }

    catch (error) {
        throw error;
    }
};

const updateSale = async (saleId, data) => {
    try {
        const sale = await Sale.findById(saleId);

        if (!sale) {
            throw new Error("Sale not found.");
        }

        // Update User
        if (data.userId) {

            const user = await User.findById(data.userId);

            if (!user) {
                throw new Error("User not found.");
            }

            sale.userId = data.userId;
        }

        // Update Brand
        if (data.brand) {
            sale.brand = data.brand;
        }

        // Update Earning
        if (data.earning) {

            if (data.earning <= 0) {
                throw new Error(
                    "Earning must be greater than zero."
                );
            }

            sale.earning = data.earning;
        }

        await sale.save();

        return sale;
    }

    catch (error) {
        throw error;
    }
};

const deleteSale = async (saleId) => {
    try {
        const sale = await Sale.findById(saleId);

        if (!sale) {
            throw new Error("Sale not found.");
        }

        await Sale.findByIdAndDelete(saleId);

        return {
            success: true,
            message: "Sale deleted successfully.",
        };

    }

    catch (error) {
        throw error;
    }
};

const reconcileSale = async (saleId, status) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        if (status !== "approved" && status !== "rejected") {
            throw new Error(
                "Status must be approved or rejected."
            );
        }

        // Find Sale
        const sale = await Sale.findById(saleId).session(session);

        if (!sale) {
            throw new Error("Sale not found.");
        }

        // Already Reconciled
        if (sale.status !== "pending") {
            throw new Error(
                "Sale has already been reconciled."
            );
        }

        // Update Status
        sale.status = status;
        sale.reconciledAt = new Date();
        await sale.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Process Final Payout
        const payout = await payoutService.processFinalPayout(sale._id);

        return {
            success: true,
            message: "Sale reconciled successfully.",
            sale,
            payout,
        };
    } 
    
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

module.exports = { createSale, getAllSales, getSaleById, updateSale, deleteSale, reconcileSale, };