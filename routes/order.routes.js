const router = require('express').Router();
const controller = require('../controllers/order.controller');
const validate = require('../middleware/validate');
const { createOrderSchema, listOrdersSchema, updateStatusSchema } = require('../validators/order.validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.use(authenticate);

router.post('/', validate(createOrderSchema), controller.create);
router.get('/mine', controller.listMine);
router.get('/', authorize('ADMIN', 'MANAGER'), validate(listOrdersSchema), controller.listAll);
router.get('/:id', controller.getById);
router.patch('/:id/status', authorize('ADMIN', 'MANAGER'), validate(updateStatusSchema), controller.updateStatus);

module.exports = router;
