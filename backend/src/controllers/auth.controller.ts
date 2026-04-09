import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: user, message: 'OTP sent to email. Please verify.' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, refreshToken, user } = await authService.loginUser(req.body);
    res.status(200).json({ success: true, token, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  // Logic to verify OTP goes here
  res.status(200).json({ success: true, message: 'OTP verified successfully' });
};