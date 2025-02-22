import * as yup from "yup";

export const registerValidationSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")

    .required("Username is required"),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")

    .required("Password is required"),

  avatar: yup.string().url("Avatar must be a valid URL").nullable(), // Allows null or undefined values

  fullName: yup
    .string()
    .min(3, "Full Name must be at least 3 characters long")
    .max(50, "Full Name must be at most 50 characters long")

    .nullable(),

  phoneNumber: yup
    .string()

    .nullable(),
});

export const loginValidationSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")

    .required("Username is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")

    .required("Password is required"),
});
