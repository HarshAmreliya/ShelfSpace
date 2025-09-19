import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.ts";
import authRoutes from "./routes/auth.routes.ts";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  // console.log(req);
  res.send("Hello from User Service!");
});

// console.log(userRoutes.stack[0]);

app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`User service running at http://localhost:${PORT}`);
});
