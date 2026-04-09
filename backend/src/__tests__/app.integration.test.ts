jest.mock('../config/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    add: jest.fn(),
  },
}));

import request from 'supertest';
import app from '../app';

describe('app integration', () => {
  it('GET /health returns API health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'UP', message: 'API is healthy' });
  });

  it('POST /api/v1/auth/verify-otp returns success', async () => {
    const response = await request(app).post('/api/v1/auth/verify-otp').send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'OTP verified successfully',
    });
  });

  it('POST /api/v1/auth/register rejects invalid payload', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'A',
      email: 'bad-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});
