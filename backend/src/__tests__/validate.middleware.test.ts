import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';

describe('validate middleware', () => {
  it('calls next for valid payload', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
      }),
      query: z.object({}).optional(),
      params: z.object({}).optional(),
    });

    const req = { body: { email: 'user@example.com' }, query: {}, params: {} } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await validate(schema as any)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with zod errors for invalid payload', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
      }),
      query: z.object({}).optional(),
      params: z.object({}).optional(),
    });

    const req = { body: { email: 'bad-email' }, query: {}, params: {} } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await validate(schema as any)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    );
  });
});
