export const checkUserOwnership = (req, res, next) => {
  const { id } = req.params;

  // If the authenticated user's ID doesn't match the requested ID, return a 403 error
  if (req.userId !== id) {
    return res
      .status(403)
      .json({ message: "You can only access your own data!" });
  }

  next();
};
