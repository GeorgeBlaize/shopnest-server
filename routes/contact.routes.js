const router = require('express').Router();
const controller = require('../controllers/contact.controller');
const validate = require('../middleware/validate');
const { createContactSchema } = require('../validators/contact.validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');
const { authRateLimiter } = require('../middleware/rateLimit');

router.post('/', authRateLimiter, validate(createContactSchema), controller.create);
router.get('/', authenticate, authorize('ADMIN'), controller.list);
router.patch('/:id/resolve', authenticate, authorize('ADMIN'), controller.resolve);

module.exports = router;
