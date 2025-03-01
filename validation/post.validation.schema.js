import * as yup from 'yup';

// PostDetail schema
const postDetailSchema = yup.object().shape({
  desc: yup.string().required("Description is required."),
  utilities: yup.string().optional(),
  pet: yup.string().oneOf(['allowed', 'not allowed'], "Pet policy must be 'allowed' or 'not allowed'").optional(),
  income: yup.string().optional(),
  size: yup.number().integer().positive("Size must be a positive integer.").optional(),
  school: yup.number().integer().positive("Distance to the school must be a positive integer.").optional(),
  bus: yup.number().integer().positive("Distance to the bus stop must be a positive integer.").optional(),
  restaurant: yup.number().integer().positive("Distance to the restaurant must be a positive integer.").optional(),
  propertyStatus: yup.string().oneOf(["Available", "Booked", "SoldOut"], "Invalid property status.").optional(),
});

// main Post schema
const postSchema = yup.object().shape({
  title: yup.string().required("Title is required."),
  price: yup.number().required("Price is required.").positive("Price must be a positive number."),
  images: yup.array().of(yup.string().url("Each image must be a valid URL.")).required(),
  address: yup.string().required("Address is required."),
  city: yup.string().required("City is required."),
  bedroom: yup.number().required("Bedroom count is required.").integer().positive("Bedroom count must be a positive integer."),
  bathroom: yup.number().required("Bathroom count is required.").integer().positive("Bathroom count must be a positive integer."),
  latitude: yup.number().required("Latitude is required."),
  longitude: yup.number().required("Longitude is required."),
  type: yup.string().oneOf(["buy", "rent"], "Type must be 'buy' or 'rent'.").required(),
  property: yup.string().oneOf(["apartment", "house", "condo", "land"], "Property type must be 'apartment', 'house', 'condo', or 'land'.").required(),
  postDetail: postDetailSchema.optional(), // Optional PostDetail object
});

export default postSchema;
