import Joi from "joi";

export const SendMessageRequest = Joi.object({
  message: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      "string.empty": "Message cannot be empty",
      "string.min": "Message cannot be empty",
      "string.max": "Message cannot exceed 5000 characters",
      "any.required": "Message is required",
    }),
});