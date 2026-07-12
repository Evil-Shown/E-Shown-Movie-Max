import type { Response } from "express";
import type { ApiErrorDetails, ApiSuccessResponse, ApiErrorResponse } from "../types/responses";

export function success<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>): void {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  res.status(statusCode).json(payload);
}

export function error(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): void {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  res.status(statusCode).json(payload);
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(statusCode: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  toApiError(): ApiErrorDetails {
    const err: ApiErrorDetails = {
      code: this.code,
      message: this.message,
    };
    if (this.details) {
      err.details = this.details;
    }
    return err;
  }
}
