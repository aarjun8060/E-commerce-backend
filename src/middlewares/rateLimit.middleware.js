const buckets = new Map();
const WINDOW_MS = 60_000;
const ENQUIRY_MAX_REQUESTS = 5;
const ADMIN_LOGIN_MAX_REQUESTS = 10;

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, WINDOW_MS);
cleanupTimer.unref?.();

function limitRequests(req, res, next, { keyPrefix, maximum, message }) {
  const now = Date.now();
  const key = `${keyPrefix}:${req.ip || req.socket.remoteAddress || "unknown"}`;
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, maximum - bucket.count);
  res.setHeader("RateLimit-Limit", String(maximum));
  res.setHeader("RateLimit-Remaining", String(remaining));
  res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > maximum) {
    res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({
      success: false,
      message,
    });
  }

  if (buckets.size > 10_000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(entryKey);
    }
  }
  return next();
}

export const enquiryRateLimit = (req, res, next) =>
  limitRequests(req, res, next, {
    keyPrefix: "enquiry",
    maximum: ENQUIRY_MAX_REQUESTS,
    message: "Too many enquiries. Please try again in a minute.",
  });

export const adminLoginRateLimit = (req, res, next) =>
  limitRequests(req, res, next, {
    keyPrefix: "admin-login",
    maximum: ADMIN_LOGIN_MAX_REQUESTS,
    message: "Too many login attempts. Please try again in a minute.",
  });
