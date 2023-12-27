import Joi, { ObjectSchema } from 'joi';

// Schemas
export const userIdSchema = Joi.object({
    id: Joi.number().integer().required(),
});


export const useremailSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).min(7).max(50).required(),
});