import logger from 'utils/logger';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'service/UserService';

export default class UserController {
  public static async create(request: Request, response: Response, next: NextFunction) {
    logger.info(`Create user ${request.body.username}`);
    try {
      const { username, password } = request.body;
      const handler = await UserService.createUserWithRole(username, password);
      return handler.toJSON(response);
    } catch (error) {
      next(error);
    }
  }

  public static async getUserMe(request: Request, response: Response, next: NextFunction) {
    logger.info(`Get user me ${request.user.id}`);
    try {
      return response.status(200).json(await UserService.getUserById(request.user.id));
    } catch (error) {
      next(error);
    }
  }

  public static async get(request: Request, response: Response, next: NextFunction) {
    logger.info(`Get user profile with id ${request.params.id}`);
    try {
      const { id } = request.params;
      return response.status(200).json(await UserService.getUserByProfileId(id));
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(_request: Request, response: Response, next: NextFunction) {
    logger.info('Get all users');
    try {
      return response.status(200).json(await UserService.getAllUsers());
    } catch (error) {
      next(error);
    }
  }

  public static async auth(request: Request, response: Response, next: NextFunction) {
    logger.info(`Authenticate user ${request.body.username}`);
    try {
      const { username, password } = request.body;
      return response.status(200).json(await UserService.authenticate(username, password));
    } catch (error) {
      next(error);
    }
  }
}
