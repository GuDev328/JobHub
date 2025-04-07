import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
import { Router } from 'express';
import { verifyEmployerController } from '~/controllers/employerControllers';

const router = Router();

router.post('/request-verification', accessTokenValidator, catchError(verifyEmployerController));

export default router;
