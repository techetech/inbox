import { Router } from 'express';
import { getQuarantined, allowMessage, blockMessage } from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/quarantined', getQuarantined);
router.post('/allow/:messageId', allowMessage);
router.post('/block/:messageId', blockMessage);

export { router as adminRoutes };
