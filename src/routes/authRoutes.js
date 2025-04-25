import express from "express";
import { loginUser, registerUser, setupTransactionPin, 
    verifyOtp,  } from "../controllers/authControllers.js";



const router = express.Router();

router.post("/register", registerUser );
router.post("/verify-email", verifyOtp );
router.post("/login", loginUser );
router.post("/setup-pin", setupTransactionPin);




export default router;