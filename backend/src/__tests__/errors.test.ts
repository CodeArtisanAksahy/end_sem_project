import { createAuthError } from '../utils/errors';

describe('createAuthError', () => {
  it('creates an Error with statusCode 401', () => {
    const error = createAuthError('Invalid credentials');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid credentials');
    expect(error.statusCode).toBe(401);
  });

  it('creates an Error with custom statusCode', () => {
    const error = createAuthError('Forbidden action', 403);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Forbidden action');
    expect(error.statusCode).toBe(403);
  });
});
