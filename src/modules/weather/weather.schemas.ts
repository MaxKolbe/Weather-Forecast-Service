import Joi from "joi";

export const querySchema = Joi.object({
    city: Joi.string().required()
})

