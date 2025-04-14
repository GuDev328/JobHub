import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';
import {
  applyJobController,
  cancelApplyJobController,
  getListApplyJobController,
  searchJobController,
  evaluateEmployerController,
  getListInvitedJobController
} from '~/controllers/candidatesControllers';
const router = Router();

router.post('/evaluate-employer/:id', accessTokenValidator, catchError(evaluateEmployerController));

router.post('/apply-job/:id', accessTokenValidator, catchError(applyJobController));
router.delete('/cancel-apply-job/:id', accessTokenValidator, catchError(cancelApplyJobController));

router.get('/list-apply-job', accessTokenValidator, catchError(getListApplyJobController));
router.get('/list-invited-job', accessTokenValidator, catchError(getListInvitedJobController));

router.get('/search-job', accessTokenValidator, catchError(searchJobController));

export default router;
