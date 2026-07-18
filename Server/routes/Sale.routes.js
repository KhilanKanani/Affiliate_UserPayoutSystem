const express = require("express");
const router = express.Router();
const saleController = require("../controllers/Sale.controller");

router.post("/", saleController.createSale);
router.get("/", saleController.getAllSales);
router.get("/:id", saleController.getSaleById);
router.put("/:id", saleController.updateSale);
router.delete("/:id", saleController.deleteSale);
router.patch("/:id/reconcile", saleController.reconcileSale);

module.exports = router;