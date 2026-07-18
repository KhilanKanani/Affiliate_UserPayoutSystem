const saleService = require("../services/Sale.service");

const createSale = async (req, res) => {
    try {
        const sale = await saleService.createSale(req.body);

        return res.status(201).json({
            success: true,
            message: "Sale created successfully.",
            data: sale,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllSales = async (req, res) => {
    try {
        const sales = await saleService.getAllSales();

        return res.status(200).json({
            success: true,
            count: sales.length,
            data: sales,
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getSaleById = async (req, res) => {
    try {
        const sale = await saleService.getSaleById(req.params.id);

        return res.status(200).json({
            success: true,
            data: sale,
        });
    }

    catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const updateSale = async (req, res) => {
    try {
        const sale = await saleService.updateSale(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Sale updated successfully.",
            data: sale,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteSale = async (req, res) => {
    try {
        await saleService.deleteSale(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Sale deleted successfully.",
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Reconcile Sale (Approve / Reject)
const reconcileSale = async (req, res) => {
    try {
        const result = await saleService.reconcileSale(
            req.params.id,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Sale reconciled successfully.",
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

module.exports = { createSale, getAllSales, getSaleById, updateSale, deleteSale, reconcileSale, };