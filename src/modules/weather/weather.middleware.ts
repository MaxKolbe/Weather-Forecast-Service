import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateQueryData =
  (schema: Joi.ObjectSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const payload = req.query;
    const { error } = schema.validate(payload);

    if (!error) {
      next();
    } else {
      return res.status(400).redirect(`/api/v1/weather/home?message=${error.details[0]?.message}`);
    }
  };

  export const validateBodyData =
  (schema: Joi.ObjectSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { error } = schema.validate(payload);

    if (!error) {
      next();
    } else {
      return res.status(400).redirect(`/api/v1/weather/home?message=${error.details[0]?.message}`);
    }
  };
