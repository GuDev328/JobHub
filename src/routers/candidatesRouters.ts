import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';
import {
  applyJobController,
  cancelApplyJobController,
  getListApplyJobController,
  searchJobController
} from '~/controllers/candidatesControllers';
const router = Router();

router.post(
  '/review-employer/:id',
  accessTokenValidator,
  catchError(() => {})
);

router.post('/apply-job/:id', accessTokenValidator, catchError(applyJobController));
router.delete('/cancel-apply-job/:id', accessTokenValidator, catchError(cancelApplyJobController));

router.get('/list-apply-job', accessTokenValidator, catchError(getListApplyJobController));

router.get('/search-job', accessTokenValidator, catchError(searchJobController));

export default router;
