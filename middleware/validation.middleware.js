const validateReqBody = (validationSchema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await validationSchema.validate(req.body, {
        abortEarly: false,
      });

      req.body = validatedData;

      next();
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }
  };
};

export default validateReqBody;
