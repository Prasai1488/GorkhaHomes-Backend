import mongoose from "mongoose";

const validateIdFromReqParams = (req, res, next) => {
  // Extract id from req.params
  const { id } = req.params;

  // Check for valid MongoDB ObjectId
  const isValidMongoId = mongoose.Types.ObjectId.isValid(id);

  // If not valid, return an error response
  if (!isValidMongoId) {
    return res.status(400).json({ message: "Invalid MongoDB ObjectId format." });
  }

  // If valid, pass control to the next middleware/route handler
  next();
};

export default validateIdFromReqParams;
