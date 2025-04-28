import express from "express";
import authRoute from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";
import propertyRoute from "./routes/property.routes.js";
import adminRoute from "./routes/admin.routes.js";
import chatRoute from "./routes/chat.routes.js";
import messageRoute from "./routes/message.routes.js";
import testimonialRoute from "./routes/testimonial.routes.js";
import resetRoute from "./routes/reset.password.route.js";
import recommendationRoute from "./routes/recommendation.routes.js";
import cors from "cors";

const app = express();

// Middleware to enable Cross-Origin Resource Sharing (CORS) with specific settings
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

// Middleware to parse cookies in incoming requests
app.use(cookieParser());

// Route for authentication-related operations
app.use("/api/auth", authRoute);

// Route for user-related operations
app.use("/api/user", userRoute);

// Route for property-related operations
app.use("/api/posts", propertyRoute);

// Route for admin-related operations
app.use("/api/admin", adminRoute);

// Route for chat-related operations
app.use("/api/chats", chatRoute);

// Route for message-related operations
app.use("/api/messages", messageRoute);

// Route for testimonial-related operations
app.use("/api/testimonials", testimonialRoute);

// Route for password reset operations
app.use("/api/reset", resetRoute);

// Route for recommendation-related operations
app.use("/api/recommendations", recommendationRoute);

// server and network port
const port = 8090; // 4000 to 10,000

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
