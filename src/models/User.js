import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["Failed", "Approved", "Pending"], default: "Pending" },
  transactionType: { type: String, enum: ["deposit", "withdrawal"], required: true },
  timestamp: { type: Date, default: Date.now },
  Transaction_ID: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, minlength: 3, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    transactionPin: { type: String, minlength: 4, select: false },
    otp: String,
    otpExpires: Date,

    wallet: {
      balance: { type: Number, default: 0 },
      currency: { type: String, default: "NGN" },
      transactions: [transactionSchema],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified("transactionPin")) {
    const salt = await bcrypt.genSalt(10);
    this.transactionPin = await bcrypt.hash(this.transactionPin, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
