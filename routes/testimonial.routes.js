import express from "express";
import { addTestimonial,getApprovedTestimonials,deleteTestimonial } from "../controllers/Testimonial/testimonial.controller.js";
import { verifyToken } from "../middleware/verify.token.js";
import validateIdFromReqParams from "../middleware/validate.id.js";

const router = express.Router();

router.post("/add",verifyToken, addTestimonial);
router.get("/get-approved-testimonials", getApprovedTestimonials);
router.delete("/delete/:id",validateIdFromReqParams,verifyToken, deleteTestimonial);

export default router;
