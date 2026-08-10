const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Internal server error';
  let details = err instanceof ApiError ? err.details : null;

  if (err.code === 'P2002') {
    statusCode = 409;
    message = `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (statusCode === 500 && !env.isProduction) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && env.isProduction ? 'Internal server error' : message,
    ...(details ? { details } : {}),
  });
}

module.exports = { notFound, errorHandler };
