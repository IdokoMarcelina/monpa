import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import req from "express/lib/request.js";
import sendEmail from '../service/sendEmail.js';

export const registerUser = async (req, res) => {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: "Phone number already registered." });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already registered." });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const user = new User({
            fullName,
            email,
            phone,
            password,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000), 
            isVerified: false
        });

        await user.save();

        const subject = "Email Verification - Your OTP Code";
        const message = `
            <h2>Hello ${fullName},</h2>
            <p>Thanks for registering!</p>
            <p>Your OTP verification code is:</p>
            <h1 style="color:#007bff;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
        `;

        await sendEmail(subject, message, email, process.env.EMAIL_USER, process.env.EMAIL_USER);

        res.status(201).json({
            message: "User registered successfully. OTP sent to email."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};



export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }

    if (user.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};



export const loginUser = async (req, res) => {
    const { email, password } = req.body; 

    try {
        const user = await User.findOne({ email }); 
        if (!user) return res.status(400).json({ message: "User not found." });

        if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            message: "Invalid Password."
        });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Login successful.", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
        console.error(error); 
    }
};

export const setupTransactionPin = async (req, res) => {
    const { email, transactionPin } = req.body; 

    if (!/^\d{4}$/.test(transactionPin)) {
        return res.status(400).json({ message: "Transaction PIN must be exactly 4 digits." });
    }

    try {
        const user = await User.findOne({ email }); 
        if (!user)
            return res.status(400).json({ message: "User not found." });
        if (!user.isVerified)
            return res.status(400).json({ message: "Please verify your email first." });

        user.transactionPin = await bcrypt.hash(transactionPin, 10);
        await user.save();

        res.json({ message: "Transaction PIN set successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
        console.error(error); 
    }
};






