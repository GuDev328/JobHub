import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';

const router = Router();

router.post(
  '/review-employer/:id',
  accessTokenValidator,
  catchError(() => {})
);

export default router;
