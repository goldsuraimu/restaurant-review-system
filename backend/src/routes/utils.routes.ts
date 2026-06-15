import { Router } from 'express';

import { authenticateToken } from '#/middleware/authenticateToken';
import * as uuidController from '#/controllers/utils/uuid.controller';

const router: Router = Router();

router.post('/uuid', authenticateToken(), uuidController.createUuid); ;

export default router;