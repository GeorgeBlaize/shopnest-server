const router = require('express').Router();
const controller = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { listUsersSchema, updateProfileSchema, updateRoleSchema } = require('../validators/user.validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

router.use(authenticate);

router.get('/', authorize('ADMIN'), validate(listUsersSchema), controller.list);
router.put('/profile', validate(updateProfileSchema), controller.updateProfile);
router.put('/:id/role', authorize('ADMIN'), validate(updateRoleSchema), controller.updateRole);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;
