export function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  }
  next();
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  console.error('[CUEC Error]', err);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}
