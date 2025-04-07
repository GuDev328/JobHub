import { accessTokenValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';
import { isAdminJobValidator, isEmployerValidator } from '~/middlewares/commonMiddlewares';
import {
  createJobController,
  deleteJobController,
  getJobController,
  getListCandidateApplyJobController,
  getListJobController,
  makeFailController,
  makeInterviewController,
  makePassController,
  recruitmentJobController,
  rejectCandidateController,
  approveCandidateController,
  updateJobController
} from '~/controllers/jobsControllers';
const router = Router();

router.post('/', accessTokenValidator, isEmployerValidator, catchError(createJobController));
router.get('/list', accessTokenValidator, catchError(getListJobController));

router.put('/recruitment/:id', accessTokenValidator, isAdminJobValidator, catchError(recruitmentJobController));

router.get(
  '/candidates/:id',
  accessTokenValidator,
  isAdminJobValidator,
  catchError(getListCandidateApplyJobController)
);

router.post('/approve/:id', accessTokenValidator, catchError(approveCandidateController));

router.post('/reject/:id', accessTokenValidator, catchError(rejectCandidateController));

router.post('/make-interview/:id', accessTokenValidator, catchError(makeInterviewController));

router.post('/make-pass/:id', accessTokenValidator, catchError(makePassController));

router.post('/make-fail/:id', accessTokenValidator, catchError(makeFailController));

router.put('/:id', accessTokenValidator, isAdminJobValidator, catchError(updateJobController));
router.get('/:id', accessTokenValidator, catchError(getJobController));
router.delete('/:id', accessTokenValidator, isAdminJobValidator, catchError(deleteJobController));

export default router;
