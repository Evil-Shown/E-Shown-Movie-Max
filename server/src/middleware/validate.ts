import type { Request, Response, NextFunction } from "express";
import { z, type ZodError } from "zod";
import { AppError } from "../utils/response";

export function validate(schema: { body?: z.ZodSchema; query?: z.ZodSchema; params?: z.ZodSchema }) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      const zodError = error as ZodError;
      const issues = zodError.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      next(new AppError(400, "VALIDATION_ERROR", "Invalid request data", { issues }));
    }
  };
}
