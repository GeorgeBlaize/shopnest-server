const router = require('express').Router();
const controller = require('../controllers/category.controller');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.get('/', controller.list);
router.post('/', authenticate, authorize('ADMIN'), validate(createCategorySchema), controller.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

module.exports = router;
