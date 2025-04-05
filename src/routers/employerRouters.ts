import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';

const router = Router();

router.post(
  '/request-verification',
  accessTokenValidator,
  catchError(() => {})
);

export default router;
