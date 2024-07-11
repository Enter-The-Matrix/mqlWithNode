import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router
  .route('/profile')
  .get(authMiddleware, getUserProfile)
  .put(authMiddleware, updateUserProfile)
  .delete(authMiddleware, deleteUser);

export default router;
