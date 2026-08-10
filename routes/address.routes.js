const router = require('express').Router();
const controller = require('../controllers/address.controller');
const validate = require('../middleware/validate');
const { createAddressSchema, updateAddressSchema } = require('../validators/address.validator');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', controller.list);
router.post('/', validate(createAddressSchema), controller.create);
router.put('/:id', validate(updateAddressSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
