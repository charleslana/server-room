import authenticateMiddleware from 'middleware/authenticateMiddleware';
import express from 'express';
import UserController from 'controller/UserController';
import { idParamMiddleware } from 'middleware/celebrate/commonCelebrate';
import { userAuthMiddleware, userCreateMiddleware } from 'middleware/celebrate/userCelebrate';
import roleMiddleware from 'middleware/roleMiddleware';
import UserRoleEnum from 'enum/UserRoleEnum';

const userRoute = express.Router();

userRoute.route('/').post(userCreateMiddleware(), UserController.create);

userRoute.route('/auth').post(userAuthMiddleware(), UserController.auth);

userRoute
  .route('/me')
  .get(
    authenticateMiddleware,
    roleMiddleware([UserRoleEnum.Admin, UserRoleEnum.User]),
    UserController.getUserMe
  );

userRoute
  .route('/profile/:id')
  .get(idParamMiddleware(), authenticateMiddleware, UserController.get);

userRoute.route('/').get(userCreateMiddleware(), UserController.getAll);

export default userRoute;
