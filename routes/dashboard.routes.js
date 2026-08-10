const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.use(authenticate);

router.get('/overview', authorize('ADMIN', 'MANAGER'), controller.overview);
router.get('/sales-over-time', authorize('ADMIN', 'MANAGER'), controller.salesOverTime);
router.get('/orders-by-status', authorize('ADMIN', 'MANAGER'), controller.ordersByStatus);
router.get('/top-products', authorize('ADMIN', 'MANAGER'), controller.topProducts);
router.get('/my-stats', controller.myStats);

module.exports = router;
