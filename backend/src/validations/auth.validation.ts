import { z } from 'zod';

export const authValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
};