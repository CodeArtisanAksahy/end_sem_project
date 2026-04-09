export const createAuthError = (message: string) => {
  const error: any = new Error(message);
  error.statusCode = 401;
  return error;
};