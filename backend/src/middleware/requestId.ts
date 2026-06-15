import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Middleware: 給每個請求一個唯一 requestId
export function attachRequestId(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string | undefined) || randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
