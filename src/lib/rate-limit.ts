


interface RateLimitContext {
  tokenBucket: Map<string, { count: number; lastReset: number }>;
}

const rateLimitContext: RateLimitContext = {
  tokenBucket: new Map(),
};

/**
 * Basic In-Memory Rate Limiter
 * @param ip  User IP Identifier
 * @param limit Max requests
 * @param windowMs Time window in milliseconds
 * @returns true if allowed, false if blocked
 */
export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitContext.tokenBucket.get(ip);

  if (!record) {
    rateLimitContext.tokenBucket.set(ip, { count: 1, lastReset: now });
    return true;
  }

  // Reset window if time passed
  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return true;
  }

  // Check limit
  if (record.count >= limit) {
    return false;
  }

  // Increment
  record.count++;
  return true;
}

/**
 * Clean up old entries periodically (Optional garbage collection)
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitContext.tokenBucket.entries()) {
    if (now - record.lastReset > 60 * 60 * 1000) { // 1 hour expiration
      rateLimitContext.tokenBucket.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Run every hour
