export const createAuthError = (message: string, statusCode = 401) => {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
};
