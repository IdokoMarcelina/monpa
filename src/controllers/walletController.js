import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { verifyPaystackReference } from "../utils/paystack.js";

// FUND WALLET
export const fundWallet = async (req, res) => {
  const { reference, userId } = req.body;
  if (!reference || !userId)
    return res.status(400).json({ success: false, message: "Missing reference or userId" });

  try {
    const { status, data } = await verifyPaystackReference(reference);
    if (!status || data.status !== "success")
      return res.status(400).json({ success: false, message: "Payment verification failed" });

    const amount = data.amount / 100;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Add funds
    user.wallet.balance += amount;
    user.wallet.transactions.push({
      userId,
      amount,
      description: `Wallet funding via Paystack`,
      status: "Approved",
      transactionType: "deposit",
      Transaction_ID: reference,
    });

    await user.save();
    res.status(200).json({ success: true, message: "Wallet funded", balance: user.wallet.balance });
  } catch (error) {
    console.error("Fund error:", error.message);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

// WITHDRAW
export const withdraw = async (req, res) => {
  const { userId, amount, transactionPin } = req.body;
  if (!userId || !amount || !transactionPin)
    return res.status(400).json({ success: false, message: "Missing required fields" });

  try {
    const user = await User.findById(userId).select("+transactionPin");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const validPin = await bcrypt.compare(transactionPin, user.transactionPin);
    if (!validPin) return res.status(403).json({ success: false, message: "Invalid PIN" });

    if (user.wallet.balance < amount)
      return res.status(400).json({ success: false, message: "Insufficient funds" });

    user.wallet.balance -= amount;
    user.wallet.transactions.push({
      userId,
      amount,
      description: `Withdrawal of ₦${amount}`,
      status: "Approved",
      transactionType: "withdrawal",
    });

    await user.save();
    res.status(200).json({ success: true, message: "Withdrawal successful", balance: user.wallet.balance });
  } catch (error) {
    console.error("Withdraw error:", error.message);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};
