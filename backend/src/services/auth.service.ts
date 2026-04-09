import { User } from '../models/user.model';
import { createAuthError } from '../utils/errors';
import jwt from 'jsonwebtoken';

export const registerUser = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw createAuthError('Email already exists');

  const user = await User.create({ ...data, otp: '123456' }); // MOCK OTP FOR DEMO
  // TO DO: Dispatch email via BullMQ -> Nodemailer
  return { id: user._id, email: user.email, name: user.name };
};

export const loginUser = async ({ email, password }: any) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw createAuthError('Invalid credentials');
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || 'r_secret', { expiresIn: '7d' });

  return { token, refreshToken, user: { id: user._id, email: user.email, role: user.role } };
};