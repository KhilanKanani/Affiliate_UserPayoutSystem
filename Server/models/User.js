const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    withdrawableBalance: {
      type: Number,
      default: 0,
    },

    totalAdvancePaid: {
      type: Number,
      default: 0,
    },

    totalFinalPaid: {
      type: Number,
      default: 0,
    },

    totalAdjustment: {
      type: Number,
      default: 0,
    },

    lastWithdrawalAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);