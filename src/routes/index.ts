import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './user';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/user', usersRouter);

export default mainRouter;
