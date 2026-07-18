const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
dotenv.config();

app.use(express.json());

app.use("/api/users", require("./routes/User.routes"));
app.use("/api/sales", require("./routes/Sale.routes"));
app.use("/api/payouts", require("./routes/Payout.routes"));
app.use("/api/withdrawals", require("./routes/Withdrawal.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
});