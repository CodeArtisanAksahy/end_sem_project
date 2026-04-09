import crypto from 'crypto';
import { cookies } from 'next/headers';
import { connectDB, UserModel } from './mongodb';

export const SESSION_COOKIE_NAME = 'session_token';
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 12);

function getRequiredSecret(name: string): string {
  const value = process.env[name];
  if (value && value.trim().length >= 64) return value;
  throw new Error(`Missing or weak required secret: ${name}`);
}

const TOKEN_PEPPER = getRequiredSecret('AUTH_TOKEN_PEPPER');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, existing] = storedHash.split(':');
  if (!salt || !existing) return false;

  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(existing, 'hex');
  const b = Buffer.from(candidate, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(`${TOKEN_PEPPER}:${token}`).digest('hex');
}

export function getSessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
}

export function getSessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}

export async function requireAuthenticatedUser() {
  await connectDB();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return null;
  }

  const sessionHash = hashToken(sessionToken);
  const user = await UserModel.findOne({
    sessionTokenHash: sessionHash,
    sessionExpiresAt: { $gt: new Date() },
  });

  if (!user) return null;
  return user;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0));
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 10) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSymbol;
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  if (email.length < 5 || email.length > 254) return false;
  if (email.includes(' ') || !email.includes('@')) return false;

  const atIndex = email.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === email.length - 1) return false;

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);
  if (!localPart || !domainPart || !domainPart.includes('.')) return false;
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;

  return true;
}
