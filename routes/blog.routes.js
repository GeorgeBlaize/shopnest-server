const router = require('express').Router();
const controller = require('../controllers/blog.controller');
const validate = require('../middleware/validate');
const { createBlogSchema, updateBlogSchema } = require('../validators/blog.validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.get('/', controller.list);
router.get('/:slug', controller.getBySlug);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(createBlogSchema), controller.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateBlogSchema), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), controller.remove);

module.exports = router;
