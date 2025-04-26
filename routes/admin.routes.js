import express from "express";
import {
  approvePost,
  rejectPost,
} from "../controllers/AdminControllers/approve.post.js";
import { verifyToken } from "../middleware/verify.token.js";
import validateIdFromReqParams from "../middleware/validate.id.js";
import {
  getAllPostsAdmin,
  adminDeletePost,
  adminUpdatePost,
} from "../controllers/AdminControllers/post.admin.controller.js";
import {
  getAllUsersAdmin,
  suspendUser,
  unsuspendUser,
} from "../controllers/AdminControllers/user.admin.controller.js";
import { getAdminDashboardStats } from "../controllers/AdminControllers/admin.dashboard.controller.js";
import {
  approveTestimonial,
  rejectTestimonial,
  getTestimonialsByStatus,
} from "../controllers/AdminControllers/testimonial.admin.controller.js";
import {
  getAdminNotifications,
  markNotificationAsRead,
} from "../controllers/AdminControllers/admin.notification.controller.js";

const router = express.Router();

router.patch(
  "/approve-post/:id",
  validateIdFromReqParams,
  verifyToken,
  approvePost
);
router.patch(
  "/reject-post/:id",
  validateIdFromReqParams,
  verifyToken,
  rejectPost
);
router.get("/posts", verifyToken, getAllPostsAdmin);
router.put(
  "/update-property/:id",
  validateIdFromReqParams,
  verifyToken,
  adminUpdatePost
);
router.delete(
  "/delete-post/:id",
  validateIdFromReqParams,
  verifyToken,
  adminDeletePost
);
router.get("/users", verifyToken, getAllUsersAdmin);
router.patch("/users/:id/suspend", verifyToken, suspendUser);
router.patch("/users/:id/unsuspend", verifyToken, unsuspendUser);
router.get("/stats", verifyToken, getAdminDashboardStats);
router.patch(
  "/approve-testimonial/:id",
  validateIdFromReqParams,
  verifyToken,
  approveTestimonial
);
router.patch(
  "/reject-testimonial/:id",
  validateIdFromReqParams,
  verifyToken,
  rejectTestimonial
);
router.get("/testimonials", verifyToken, getTestimonialsByStatus);
router.get("/notifications", verifyToken, getAdminNotifications);
router.patch("/notifications/:id/read", verifyToken, markNotificationAsRead);

export default router;
