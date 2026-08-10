const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, firebaseLoginSchema } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimit');

router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/firebase-login', authRateLimiter, validate(firebaseLoginSchema), controller.firebaseLogin);
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, controller.logout);

module.exports = router;
