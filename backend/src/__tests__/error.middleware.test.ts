jest.mock('../config/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

import { errorHandler } from '../middlewares/error.middleware';
import logger from '../config/logger';

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  it('uses provided statusCode and message', () => {
    process.env.NODE_ENV = 'production';
    const err = { message: 'Forbidden', statusCode: 403 };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    errorHandler(err, {} as any, res, jest.fn());

    expect((logger as any).error).toHaveBeenCalledWith('Forbidden', err);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden' });
  });

  it('falls back to 500 and includes stack in development', () => {
    process.env.NODE_ENV = 'development';
    const err = { message: '', stack: 'trace' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    errorHandler(err, {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
      stack: 'trace',
    });
  });
});
