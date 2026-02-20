const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
