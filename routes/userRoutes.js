const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);


router.get('/details', authMiddleware, (req, res) => {
  res.json(req.user);
});


router.put('/update', authMiddleware, userController.updateUser);
router.post('/reset-password', authMiddleware, userController.resetPassword);
router.post('/logout', authMiddleware, userController.logoutUser);
router.delete('/delete', authMiddleware, userController.deleteUser);

module.exports = router;
