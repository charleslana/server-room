import DecodeType from 'types/DecodeType';
import HandlerError from '../handler/HandlerError';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'service/UserService';

const handleUnauthorizedError = (next: NextFunction): void => {
  next(new HandlerError('Não autorizado.', 401));
};

const authenticateMiddleware = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = request.get('Authorization');
    if (!authHeader) {
      return handleUnauthorizedError(next);
    }
    const bearer = authHeader.split(' ')[0].toLowerCase();
    const token = authHeader.split(' ')[1];
    if (!token && bearer !== 'bearer') {
      return handleUnauthorizedError(next);
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decode) {
      return handleUnauthorizedError(next);
    }
    const { user } = decode as DecodeType;
    const userLogged = await UserService.getUserByUserIdAndAuthToken(user.id, user.authToken);
    if (!userLogged) {
      return handleUnauthorizedError(next);
    }
    request.user = {
      id: user.id,
      roles: user.roles,
    };
    return next();
  } catch (error) {
    handleUnauthorizedError(next);
  }
};

export default authenticateMiddleware;
