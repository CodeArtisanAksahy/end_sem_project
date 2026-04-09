type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
// NOTE: This in-memory limiter is suitable for single-instance deployments only.
// Use a distributed backend (e.g., Redis) for production multi-instance consistency.

export function applyRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0, remaining: maxRequests - 1 };
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  return { allowed: true, retryAfter: 0, remaining: maxRequests - bucket.count };
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
