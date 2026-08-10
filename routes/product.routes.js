const router = require('express').Router();
const controller = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const {
  listProductsSchema,
  createProductSchema,
  updateProductSchema,
} = require('../validators/product.validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.get('/', validate(listProductsSchema), controller.list);
router.get('/:slug', controller.getBySlug);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(createProductSchema), controller.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateProductSchema), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

module.exports = router;
