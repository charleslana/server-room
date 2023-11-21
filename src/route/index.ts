import userRoute from './userRoute';
import { Router } from 'express';

const routes = Router();

routes.use('/user', userRoute);

export default routes;
