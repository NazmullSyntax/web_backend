const express = require('express');
const { register, login, getProfile, deleteUser, getAllUsers } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllUsers);

module.exports = router;