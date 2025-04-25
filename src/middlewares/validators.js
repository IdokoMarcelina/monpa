import { body } from "express-validator";

export const registerValidation = [
    body("fullName").isString().isLength({ min: 3}).withMessage("Full name must be at least 3 characters long."),
    body("email").isEmail().withMessage("Invaid email format."),

    body("phone").isMobilePhone().withMessage("Invalid phone number format."),
    body("password")
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/\d/)
    .matches(/[@$!%*?&//#]/)
    .withMessage("Password must contain at least 8 characters, an uppercase, a lowercase, a number, and a special character."),
];