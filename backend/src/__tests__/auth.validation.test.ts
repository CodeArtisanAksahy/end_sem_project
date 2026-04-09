import { authValidation } from '../validations/auth.validation';

describe('authValidation schemas', () => {
  it('accepts valid register payload', async () => {
    await expect(
      authValidation.register.parseAsync({
        body: {
          name: 'Alice',
          email: 'alice@example.com',
          password: 'secret123',
        },
      })
    ).resolves.toEqual(
      expect.objectContaining({
        body: expect.objectContaining({
          email: 'alice@example.com',
        }),
      })
    );
  });

  it('rejects invalid register payload', async () => {
    await expect(
      authValidation.register.parseAsync({
        body: {
          name: 'A',
          email: 'not-an-email',
          password: '123',
        },
      })
    ).rejects.toBeDefined();
  });

  it('accepts valid login payload', async () => {
    await expect(
      authValidation.login.parseAsync({
        body: {
          email: 'alice@example.com',
          password: 'secret123',
        },
      })
    ).resolves.toEqual(
      expect.objectContaining({
        body: expect.objectContaining({
          email: 'alice@example.com',
        }),
      })
    );
  });

  it('rejects invalid login payload', async () => {
    await expect(
      authValidation.login.parseAsync({
        body: {
          email: 'bad-email',
          password: 'secret123',
        },
      })
    ).rejects.toBeDefined();
  });
});
