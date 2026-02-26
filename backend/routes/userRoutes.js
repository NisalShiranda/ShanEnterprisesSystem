const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.get('/', protect, admin, getUsers);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id')
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
