import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId | string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_never_use_in_production_12345';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId.toString() }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

