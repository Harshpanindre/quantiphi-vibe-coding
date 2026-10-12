/**
 * Global error handling middleware.
 * Catches any unhandled errors passed via next(err) and returns
 * a structured JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ [${statusCode}] ${req.method} ${req.path}: ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
