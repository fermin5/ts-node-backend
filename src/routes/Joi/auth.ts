import Joi, { ObjectSchema } from 'joi';

// Schemas
export const userRegistrationSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email({ tlds: { allow: false } }).min(7).max(50).required(),
    password: Joi.string().min(8).max(50).required(),
});

export const userAuthenticationSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).min(7).max(50).required(),
    password: Joi.string().min(8).max(50).required(),
});

// Validation helper
export const validateJoiObject = (data: any, schema: ObjectSchema) => {
    const validationResult = schema.validate(data, { abortEarly: false });

    if (validationResult.error) {
        return { valid: false, errors: validationResult.error.details };
    }

    return { valid: true, data: validationResult.value };
};
