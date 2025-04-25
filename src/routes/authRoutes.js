import express from "express";
import { forgotPassword, loginUser, registerUser, resetPassword, setupTransactionPin, 
    verifyOtp,  } from "../controllers/authControllers.js";



const router = express.Router();

router.post("/register", registerUser );
router.post("/verify-email", verifyOtp );
router.post("/login", loginUser );
router.post("/setup-pin", setupTransactionPin);
// router.post("/forgot-password", forgotPassword );
// router.post("/reset-password", resetPassword );




export default router;