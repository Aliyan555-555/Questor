import Joi from 'joi';
import mongoose from 'mongoose';

// Custom Joi validator for MongoDB ObjectId
const objectId = Joi.custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId');

export const createQuizValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  creator: objectId.required(),
  coverImage: Joi.string().allow(''),
  isPrivet: Joi.boolean(),
  status: Joi.string().valid('active', 'inactive', 'draft'),
  theme: objectId,
  questions: Joi.array().items(objectId).required(),
});

export const updateQuizValidation = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(''),
  creator: objectId,
  coverImage: Joi.string().allow(''),
  isPrivet: Joi.boolean(),
  status: Joi.string().valid('active', 'inactive', 'draft'),
  theme: objectId,
  questions: Joi.array().items(objectId),
}).min(1); // Ensure at least one field is provided for update
