import { accessTokenValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';
import { isAdminJobValidator, isEmployerValidator } from '~/middlewares/commonMiddlewares';
import {
  createJobController,
  deleteJobController,
  getJobController,
  getListJobController,
  updateJobController
} from '~/controllers/jobsControllers';
const router = Router();

router.post('/', accessTokenValidator, isEmployerValidator, catchError(createJobController));
router.get('/list', accessTokenValidator, catchError(getListJobController));
router.put('/:id', accessTokenValidator, isAdminJobValidator, catchError(updateJobController));
router.get('/:id', accessTokenValidator, catchError(getJobController));
router.delete('/:id', accessTokenValidator, isAdminJobValidator, catchError(deleteJobController));

router.post(
  '/:id/recruitment',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

router.post(
  '/:id/apply',
  accessTokenValidator,
  catchError(() => {})
);

router.get(
  '/:id/candidates',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

router.post(
  '/:id/approve',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

router.post(
  '/:id/reject',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

router.post(
  '/:id/make-interview',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

router.post(
  '/:id/make-pass',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

router.post(
  '/:id/make-fail',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(() => {})
);

export default router;
