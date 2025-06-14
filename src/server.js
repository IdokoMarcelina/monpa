import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js"
import walletRoutes from "./routes/walletRoutes.js"

dotenv.config();

const app = express();

const router = express.Router();
connectDB();

app.use(express.json());
app.use(morgan("dev"));


const allowedOrigins = [
    "http://localhost:5173",     // Vite dev
    "https://monpa-webapp.vercel.app"  // your production frontend, update to real Vercel domain if needed
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
  

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.get('/', (req,res)=>{
    res.json({message: "server is up and running"})
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//hhRYt21RvbHTf8F1