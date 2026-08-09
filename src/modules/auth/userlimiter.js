import  rateLimit from 'express-rate-limit';


export const userlimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers

  handler: (req, res, next, options) => {
    const resetTime = req.rateLimit.resetTime?.getTime() || Date.now() + options.windowMs;
    const retryAfterMs = resetTime - Date.now();
    const retryAfterMinutes = Math.ceil(retryAfterMs / 60000);

    res.status(429).json({
      success: false,
      message: `Too many login attempts. Try again in ${retryAfterMinutes} minute(s).`
    });
  }
});
