jest.mock('../services/auth.service', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

import * as authService from '../services/auth.service';
import { login, register, verifyOTP } from '../controllers/auth.controller';

describe('auth.controller', () => {
  const mockedRegisterUser = authService.registerUser as jest.Mock;
  const mockedLoginUser = authService.loginUser as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register returns 201 with user payload', async () => {
    mockedRegisterUser.mockResolvedValue({ id: '1', email: 'a@b.com', name: 'Alice' });

    const req = { body: { email: 'a@b.com' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await register(req, res, next);

    expect(mockedRegisterUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: '1', email: 'a@b.com', name: 'Alice' },
      message: 'OTP sent to email. Please verify.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('register forwards errors to next', async () => {
    const error = new Error('register failed');
    mockedRegisterUser.mockRejectedValue(error);

    const req = { body: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('login returns 200 with auth tokens and user', async () => {
    mockedLoginUser.mockResolvedValue({
      token: 'token',
      refreshToken: 'refresh',
      user: { id: '1', email: 'a@b.com', role: 'user' },
    });

    const req = { body: { email: 'a@b.com', password: 'secret' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await login(req, res, next);

    expect(mockedLoginUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: 'token',
      refreshToken: 'refresh',
      user: { id: '1', email: 'a@b.com', role: 'user' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('login forwards errors to next', async () => {
    const error = new Error('login failed');
    mockedLoginUser.mockRejectedValue(error);

    const req = { body: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('verifyOTP returns success message', async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await verifyOTP({} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'OTP verified successfully',
    });
  });
});
