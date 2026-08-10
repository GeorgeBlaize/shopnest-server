const router = require('express').Router();
const controller = require('../controllers/review.controller');
const validate = require('../middleware/validate');
const { createReviewSchema } = require('../validators/review.validator');
const { authenticate } = require('../middleware/auth');

router.get('/product/:productId', controller.listByProduct);
router.post('/', authenticate, validate(createReviewSchema), controller.create);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
