import express from "express";
import { fundWallet, withdraw } from "../controllers/walletController.js";

const router = express.Router();

router.post("/fund", fundWallet);
router.post("/withdraw", withdraw);

export default router;
