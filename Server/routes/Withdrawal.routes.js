const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawal.controller");

router.post("/", withdrawalController.createWithdrawal);
router.get("/", withdrawalController.getAllWithdrawals);
router.get("/user/:userId", withdrawalController.getUserWithdrawals);
router.get("/:id", withdrawalController.getWithdrawalById);
router.patch("/:id/status", withdrawalController.updateWithdrawalStatus);
// Recover failed / cancelled / rejected withdrawal
router.patch("/:id/recover", withdrawalController.recoverFailedWithdrawal);

module.exports = router;