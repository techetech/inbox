import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
// import { mailDeliveryQueue } from '../queue/queues'; // Temporarily disabled

export const getInbox = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = Database.getInstance();
    
    // Get user's mailbox, create if doesn't exist
    let mailboxResult = await db.query(
      'SELECT id FROM mailboxes WHERE user_id = $1 AND name = $2',
      [req.user?.id, 'Inbox']
    );

    let mailboxId;
    if (mailboxResult.rows.length === 0) {
      // Create default inbox if it doesn't exist
      const newMailboxId = uuidv4();
      await db.query(
        'INSERT INTO mailboxes (id, user_id, name) VALUES ($1, $2, $3)',
        [newMailboxId, req.user?.id, 'Inbox']
      );
      mailboxId = newMailboxId;
      logger.info(`Created default inbox for user ${req.user?.email}`);
    } else {
      mailboxId = mailboxResult.rows[0].id;
    }

    // Get messages
    const messagesResult = await db.query(
      `SELECT id, from_email, subject, body_text, received_at, status, 
              spf_result, dkim_result, dmarc_result
       FROM messages 
       WHERE mailbox_id = $1 
       ORDER BY received_at DESC 
       LIMIT 50`,
      [mailboxId]
    );

    res.json({
      success: true,
      data: {
        messages: messagesResult.rows
      }
    });
  } catch (error) {
    throw error;
  }
};

export const sendMail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      throw createError('To, subject, and body are required', 400);
    }

    const db = Database.getInstance();
    const messageId = uuidv4();

    // Create message record
    await db.query(
      `INSERT INTO messages (id, from_email, to_emails, subject, body_text, 
                           received_at, direction, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        messageId,
        req.user?.email,
        Array.isArray(to) ? to : [to],
        subject,
        body,
        new Date(),
        1, // outbound
        'pending'
      ]
    );

    // Queue for delivery (temporarily disabled)
    // await mailDeliveryQueue.add('deliver-mail', {
    //   messageId,
    //   from: req.user?.email,
    //   to: Array.isArray(to) ? to : [to],
    //   subject,
    //   body
    // });

    logger.info(`Mail stored successfully from ${req.user?.email} to ${to} (queue disabled)`);

    res.status(201).json({
      success: true,
      message: 'Mail sent successfully',
      data: { messageId }
    });
  } catch (error) {
    throw error;
  }
};

export const deleteMail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const db = Database.getInstance();

    // Verify message belongs to user
    const result = await db.query(
      `SELECT m.id FROM messages m
       JOIN mailboxes mb ON m.mailbox_id = mb.id
       WHERE m.id = $1 AND mb.user_id = $2`,
      [messageId, req.user?.id]
    );

    if (result.rows.length === 0) {
      throw createError('Message not found', 404);
    }

    // Delete message (soft delete)
    await db.query(
      'UPDATE messages SET status = $1 WHERE id = $2',
      ['deleted', messageId]
    );

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

export const getMessageById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const db = Database.getInstance();

    // Get message details with verification that user owns it
    const result = await db.query(
      `SELECT m.id, m.from_email, m.to_emails, m.cc_emails, m.bcc_emails, 
              m.subject, m.body_text, m.body_html, m.received_at, m.status,
              m.spf_result, m.dkim_result, m.dmarc_result
       FROM messages m
       JOIN mailboxes mb ON m.mailbox_id = mb.id
       WHERE m.id = $1 AND mb.user_id = $2`,
      [messageId, req.user?.id]
    );

    if (result.rows.length === 0) {
      throw createError('Message not found', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    throw error;
  }
};

export const replyToMail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { body, replyAll = false } = req.body;
    const db = Database.getInstance();

    // Get original message
    const originalResult = await db.query(
      `SELECT m.from_email, m.to_emails, m.cc_emails, m.subject, m.body_text
       FROM messages m
       JOIN mailboxes mb ON m.mailbox_id = mb.id
       WHERE m.id = $1 AND mb.user_id = $2`,
      [messageId, req.user?.id]
    );

    if (originalResult.rows.length === 0) {
      throw createError('Original message not found', 404);
    }

    const original = originalResult.rows[0];
    
    // Determine recipients
    let to = [original.from_email];
    let cc: string[] = [];
    
    if (replyAll) {
      // Add original TO recipients (excluding current user)
      const originalTo = Array.isArray(original.to_emails) ? original.to_emails : [original.to_emails];
      to = [...to, ...originalTo.filter((email: string) => email !== req.user?.email)];
      
      // Add original CC recipients (excluding current user)
      if (original.cc_emails) {
        const originalCc = Array.isArray(original.cc_emails) ? original.cc_emails : [original.cc_emails];
        cc = originalCc.filter((email: string) => email !== req.user?.email);
      }
    }

    // Create reply subject
    const replySubject = original.subject.startsWith('Re: ') 
      ? original.subject 
      : `Re: ${original.subject}`;

    // Create reply body with original message
    const replyBody = `${body}\n\n--- Original Message ---\nFrom: ${original.from_email}\nSubject: ${original.subject}\n\n${original.body_text}`;

    // Create new message
    const newMessageId = uuidv4();
    
    // Get user's mailbox
    const mailboxResult = await db.query(
      'SELECT id FROM mailboxes WHERE user_id = $1 AND name = $2',
      [req.user?.id, 'Sent']
    );

    let mailboxId;
    if (mailboxResult.rows.length === 0) {
      // Create Sent mailbox if it doesn't exist
      mailboxId = uuidv4();
      await db.query(
        'INSERT INTO mailboxes (id, user_id, name) VALUES ($1, $2, $3)',
        [mailboxId, req.user?.id, 'Sent']
      );
    } else {
      mailboxId = mailboxResult.rows[0].id;
    }

    await db.query(
      `INSERT INTO messages (id, mailbox_id, from_email, to_emails, cc_emails, subject, body_text,
                           received_at, direction, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newMessageId,
        mailboxId,
        req.user?.email,
        to,
        cc.length > 0 ? cc : null,
        replySubject,
        replyBody,
        new Date(),
        1, // outbound
        'sent'
      ]
    );

    logger.info(`Reply sent from ${req.user?.email} to ${to.join(', ')}`);

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: { messageId: newMessageId }
    });
  } catch (error) {
    throw error;
  }
};

export const forwardMail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { to, body, subject } = req.body;
    const db = Database.getInstance();

    if (!to || !Array.isArray(to) || to.length === 0) {
      throw createError('Recipients are required for forwarding', 400);
    }

    // Get original message
    const originalResult = await db.query(
      `SELECT m.from_email, m.to_emails, m.subject, m.body_text, m.received_at
       FROM messages m
       JOIN mailboxes mb ON m.mailbox_id = mb.id
       WHERE m.id = $1 AND mb.user_id = $2`,
      [messageId, req.user?.id]
    );

    if (originalResult.rows.length === 0) {
      throw createError('Original message not found', 404);
    }

    const original = originalResult.rows[0];
    
    // Create forward subject
    const forwardSubject = subject || (original.subject.startsWith('Fwd: ') 
      ? original.subject 
      : `Fwd: ${original.subject}`);

    // Create forward body with original message
    const forwardBody = `${body || ''}\n\n--- Forwarded Message ---\nFrom: ${original.from_email}\nDate: ${original.received_at}\nSubject: ${original.subject}\nTo: ${Array.isArray(original.to_emails) ? original.to_emails.join(', ') : original.to_emails}\n\n${original.body_text}`;

    // Create new message
    const newMessageId = uuidv4();
    
    // Get user's mailbox
    const mailboxResult = await db.query(
      'SELECT id FROM mailboxes WHERE user_id = $1 AND name = $2',
      [req.user?.id, 'Sent']
    );

    let mailboxId;
    if (mailboxResult.rows.length === 0) {
      // Create Sent mailbox if it doesn't exist
      mailboxId = uuidv4();
      await db.query(
        'INSERT INTO mailboxes (id, user_id, name) VALUES ($1, $2, $3)',
        [mailboxId, req.user?.id, 'Sent']
      );
    } else {
      mailboxId = mailboxResult.rows[0].id;
    }

    await db.query(
      `INSERT INTO messages (id, mailbox_id, from_email, to_emails, subject, body_text,
                           received_at, direction, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newMessageId,
        mailboxId,
        req.user?.email,
        to,
        forwardSubject,
        forwardBody,
        new Date(),
        1, // outbound
        'sent'
      ]
    );

    logger.info(`Message forwarded from ${req.user?.email} to ${to.join(', ')}`);

    res.status(201).json({
      success: true,
      message: 'Message forwarded successfully',
      data: { messageId: newMessageId }
    });
  } catch (error) {
    throw error;
  }
};
