const express = require("express");
const router = express.Router();
const payoutController = require("../controllers/payout.controller");

// Run 10% advance payout job
router.post("/advance", payoutController.processAdvancePayout);
// Process final payout after admin reconciliation
router.post("/final/:saleId", payoutController.processFinalPayout);
// Recover failed/cancelled/rejected payout
router.patch("/recover/:payoutId", payoutController.recoverFailedPayout);
router.get("/history/:userId", payoutController.getUserPayoutHistory);
router.get("/:id", payoutController.getPayoutById);

module.exports = router;