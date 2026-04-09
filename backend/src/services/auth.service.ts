import { User } from '../models/user.model';
import { createAuthError } from '../utils/errors';
import jwt from 'jsonwebtoken';

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw createAuthError(`${name} is not configured`, 500);
  }
  return value;
};

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const registerUser = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw createAuthError('Email already exists', 409);

  const user = await User.create({
    ...data,
    otp: createOtp(),
    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    isVerified: false,
  });
  // TO DO: Dispatch email via BullMQ -> Nodemailer
  return { id: user._id, email: user.email, name: user.name };
};

export const loginUser = async ({ email, password }: any) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw createAuthError('Invalid credentials');
  }

  if (!user.isVerified) {
    throw createAuthError('Email verification required', 403);
  }

  const jwtSecret = getRequiredEnv('JWT_SECRET');
  const refreshTokenSecret = getRequiredEnv('REFRESH_TOKEN_SECRET');

  const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, refreshTokenSecret, { expiresIn: '7d' });

  return { token, refreshToken, user: { id: user._id, email: user.email, role: user.role } };
};
