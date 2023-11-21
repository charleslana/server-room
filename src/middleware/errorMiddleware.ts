import HandlerError from 'handler/HandlerError';
import logger from 'utils/logger';
import { NextFunction, Request, Response } from 'express';

const errorMiddleware = (
  err: HandlerError,
  _request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const error = err.error || true;
  const message = err.message || 'Erro interno do servidor';
  const statusCode = err.statusCode || 500;
  logger.error(message);
  return response.status(statusCode).json({ error, message });
};

export default errorMiddleware;
