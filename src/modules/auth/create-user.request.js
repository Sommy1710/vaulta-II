import Joi from "joi";

export const CreateUserRequest = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(32).required(),
});

export const UpdateUserRequest = Joi.object({
  firstname: Joi.string().min(3).max(30).optional(),
  lastname: Joi.string().min(3).max(30).optional(),
  username: Joi.string().min(3).max(30).optional(),
}).or('firstname', 'lastname', 'username'); // Ensures at least one field is provided


export const ChangeUserPasswordRequest = Joi.object({
  oldPassword: Joi.string().min(6).max(32).required(),
  newPassword: Joi.string().min(6).max(32).required(),
});