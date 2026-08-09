import Joi from "joi";

export const CreateAdminRequest = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(32).required(),
});

export const UpdateAdminRequest = Joi.object({
  username: Joi.string().min(3).max(30).required(),
});