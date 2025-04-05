import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';

const router = Router();

router.get(
  '/list-accounts',
  accessTokenValidator,
  catchError(() => {})
);

router.post(
  '/accounts/:id/block',
  accessTokenValidator,
  catchError(() => {})
);

router.post(
  '/accounts/:id/unblock',
  accessTokenValidator,
  catchError(() => {})
);

router.get(
  '/accounts/:id/detail',
  accessTokenValidator,
  catchError(() => {})
);

router.get(
  '/list/verify-requests',
  accessTokenValidator,
  catchError(() => {})
);

router.post(
  '/verify-requests/:id/approve',
  accessTokenValidator,
  catchError(() => {})
);

router.post(
  '/verify-requests/:id/reject',
  accessTokenValidator,
  catchError(() => {})
);

export default router;
