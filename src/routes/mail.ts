import { Router } from 'express';
import { getInbox, sendMail, deleteMail, getMessageById, replyToMail, forwardMail } from '../controllers/mailController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All mail routes require authentication
router.use(authenticateToken);

router.get('/inbox', getInbox);
router.get('/:messageId', getMessageById);
router.post('/send', sendMail);
router.post('/:messageId/reply', replyToMail);
router.post('/:messageId/forward', forwardMail);
router.delete('/:messageId', deleteMail);

export { router as mailRoutes };
