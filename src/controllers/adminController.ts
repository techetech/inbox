import { Response } from 'express';
import { Database } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

export const getQuarantined = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = Database.getInstance();
    
    const result = await db.query(
      `SELECT id, from_email, to_emails, subject, received_at, status,
              spf_result, dkim_result, dmarc_result
       FROM messages 
       WHERE status = 'quarantined'
       ORDER BY received_at DESC 
       LIMIT 100`
    );

    res.json({
      success: true,
      data: {
        quarantinedMessages: result.rows
      }
    });
  } catch (error) {
    throw error;
  }
};

export const allowMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const db = Database.getInstance();

    // Update message status to delivered
    const result = await db.query(
      'UPDATE messages SET status = $1 WHERE id = $2 AND status = $3 RETURNING id',
      ['delivered', messageId, 'quarantined']
    );

    if (result.rows.length === 0) {
      throw createError('Quarantined message not found', 404);
    }

    logger.info(`Admin ${req.user?.email} allowed quarantined message ${messageId}`);

    res.json({
      success: true,
      message: 'Message allowed and delivered'
    });
  } catch (error) {
    throw error;
  }
};

export const blockMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const db = Database.getInstance();

    // Update message status to blocked
    const result = await db.query(
      'UPDATE messages SET status = $1 WHERE id = $2 AND status = $3 RETURNING id',
      ['blocked', messageId, 'quarantined']
    );

    if (result.rows.length === 0) {
      throw createError('Quarantined message not found', 404);
    }

    logger.info(`Admin ${req.user?.email} blocked quarantined message ${messageId}`);

    res.json({
      success: true,
      message: 'Message blocked'
    });
  } catch (error) {
    throw error;
  }
};
