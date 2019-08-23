import { Router, Request, Response} from 'express';
import * as AuthModel from '../models/auth';
import * as AuthService from '../services/auth';
import * as errors from '../../helpers/error';
const router = Router();

import { ILoginIn, IUser } from '../../types/user.types';

router.post('/register', (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  if (!email || !firstName || !lastName || !password) {
    return errors.errorHandler(res, 'You have to pass all the details in order to register', '');
  }
  
  const existingUserCheck = AuthModel.checkUserExists(email);
  return existingUserCheck
    .then((userChecks: ILoginIn) => {
      if (userChecks) {
        return errors.errorHandler(res, 'You are already registered', null);
      }
      return AuthService.createUser({ firstName, lastName, email, password });
    })
    .then((user: IUser) => {
      return AuthModel.logUserActivity(user.id, 'signup');
    })
    .then(() => {
      return res.send({ success: true });
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errors.errorHandler(res, 'You must send all login details.', null);
  }
  return AuthService.loginUser({ email, password })
    .then((user: IUser) => {
      const authToken = AuthService.createToken(user);
      const refreshToken = AuthService.createRefreshToken(user.email);
      const userActivityLog = AuthModel.logUserActivity(user.id, 'login');
      return Promise.all([authToken, refreshToken, userActivityLog]).then(
        tokens => {
          return {
            authToken: tokens[0],
            refreshToken: tokens[1]
          };
        }
      );
    })
    .then((user: IUser) => {
      return (
        user &&
        res.send({
          success: true,
          authToken: user.authToken,
          refreshToken: user.refreshToken
        })
      );
    })
    .catch((err: any) => {
      return errors.errorHandler(res, err.message, null);
    });
});

router.post('/validate', (req: Request, res: Response) => {
  const authToken = req.body.authToken;
  if (!authToken) {
    return errors.errorHandler(res, 'No auth token.', null);
  }
  return AuthService.validateAuthToken(authToken)
    .then((validated: boolean) => {
      res.send({
        success: true
      });
    })
    .catch((err: string) => {
      res.send({
        success: false
      });
    });
});

module.exports = router;