import express from "express";
import authRoute from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";

const app = express();

// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

// Middleware to parse cookies in incoming requests
app.use(cookieParser());

// Route for authentication-related operations
app.use("/api/auth", authRoute);

// Route for user-related operations
app.use("/api/user", userRoute);

// server and network port
const port = 8090; // 4000 to 10,000

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
