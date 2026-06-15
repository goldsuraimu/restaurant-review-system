import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '#/utils/api-error';
import logger from '#/utils/logger';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 如果是自訂 ApiError
  if (err instanceof ApiError) {
    const status = err.status || 500;

    logger[status >= 500 ? 'error' : 'warn']('ApiError', {
      requestId: req.requestId,
      status,
      code: err.code,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
      cause: err.cause instanceof Error ? err.cause.stack : undefined,
      debugMessage: err.debugMessage,
      type: err.type,
    });

    return res.status(status).json({
      status,
      code: err.code,
      message: err.message,
      requestId: req.requestId,
      type: err.type,
      debugMessage:
        process.env.NODE_ENV === 'development' ? err.debugMessage : undefined,
    });
  }

  // 非 ApiError → 系統錯誤
  logger.error('Unhandled Error', {
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  return res.status(500).json({
    status: 500,
    code: 'SERVER_ERROR',
    message: '系統發生錯誤，請稍後再試',
    requestId: req.requestId,
    debugMessage:
      process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}