export function logAuthEvent(event: {
  type: 'login_success' | 'login_failure' | 'account_created' | 'email_verification_sent' | 'password_reset_requested' | 'password_reset_completed' | 'email_verified' | 'logout';
  email?: string;
  userId?: string;
  ip?: string;
  reason?: string;
}) {
  console.info('[AUTH_EVENT]', {
    timestamp: new Date().toISOString(),
    ...event,
  });
}

export function logSuspiciousTraffic(event: {
  ip?: string;
  path?: string;
  reason: string;
}) {
  console.warn('[SUSPICIOUS_TRAFFIC]', {
    timestamp: new Date().toISOString(),
    ...event,
  });
}

export function logApiError(event: {
  path?: string;
  method?: string;
  message: string;
}) {
  console.error('[API_ERROR]', {
    timestamp: new Date().toISOString(),
    ...event,
  });
}
