const express = require('express');
const router = express.Router();
const {
    getMachines,
    getMachineById,
    createMachine,
    updateMachine,
    deleteMachine,
} = require('../controllers/machineController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getMachines).post(protect, createMachine);
router
    .route('/:id')
    .get(getMachineById)
    .put(protect, updateMachine)
    .delete(protect, deleteMachine);

module.exports = router;
