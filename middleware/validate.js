const ApiError = require('../utils/ApiError');

function validate(schema) {
  return function validator(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.slice(1).join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }

    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params;
    // Express 5 exposes `req.query` as a read-only getter backed by the raw
    // URL, so coerced query values (numbers, booleans) can't be written back
    // onto it — expose them separately instead.
    req.validatedQuery = result.data.query || {};
    next();
  };
}

module.exports = validate;
