import Joi, { ObjectSchema } from 'joi';

// Validation helper
export const validateJoiObject = (data: any, schema: ObjectSchema) => {
    const validationResult = schema.validate(data, { abortEarly: false });

    if (validationResult.error) {
        return { valid: false, errors: validationResult.error.details };
    }

    return { valid: true, data: validationResult.value };
};
