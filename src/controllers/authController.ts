import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database/connection';
import { config } from '../config/config';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    const db = Database.getInstance();
    
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw createError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
    
    // Create user
    const userId = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password_hash, name, created_at) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, hashedPassword, name || null, new Date()]
    );

    // Create default inbox
    await db.query(
      'INSERT INTO mailboxes (id, user_id, name) VALUES ($1, $2, $3)',
      [uuidv4(), userId, 'Inbox']
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { userId, email }
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    logger.info(`Login attempt for email: ${email}`);

    const db = Database.getInstance();
    
    // Find user
    const result = await db.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    );

    logger.info(`Database query result: ${result.rows.length} users found`);

    if (result.rows.length === 0) {
      logger.warn(`No user found for email: ${email}`);
      throw createError('Invalid credentials', 401);
    }

    const user = result.rows[0];
    logger.info(`Found user: ${user.email}, role: ${user.role}`);

    // Verify password
    logger.info(`Comparing password for user: ${user.email}`);
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    logger.info(`Password validation result: ${isValidPassword}`);
    
    if (!isValidPassword) {
      logger.warn(`Invalid password for user: ${email}`);
      throw createError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = Database.getInstance();
    
    const result = await db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    throw error;
  }
};
