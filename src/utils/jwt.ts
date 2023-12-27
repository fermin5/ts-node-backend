import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

const jwtSecret = uuidv4();

export const generateToken = (user: { id: number; email: string }): string => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    jwtSecret,
    { expiresIn: '1h' }
  );
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    if (typeof user === 'object' && 'userId' in user && 'email' in user) {
      req.user = user as { userId: number; email: string };
      next();
    } else {
      res.status(403).json({ message: 'Invalid token payload' });
    }
  });
};