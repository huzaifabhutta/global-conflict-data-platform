import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationErrors.push(
          `Body: ${error.details.map((d) => d.message).join(", ")}`
        );
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationErrors.push(
          `Query: ${error.details.map((d) => d.message).join(", ")}`
        );
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationErrors.push(
          `Params: ${error.details.map((d) => d.message).join(", ")}`
        );
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    return next();
  };
};
