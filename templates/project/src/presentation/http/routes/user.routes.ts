import { Router } from 'express';
import { container } from '../../../infrastructure/container';
import { TYPES } from '../../../infrastructure/types';
import { UserController } from '../controllers/user.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

// Routes
router.post('/users', 
  validationMiddleware(CreateUserDto),
  userController.createUser
);

router.get('/users', userController.getAllUsers);

router.get('/users/:id', userController.getUserById);

router.put('/users/:id', 
  validationMiddleware(UpdateUserDto),
  userController.updateUser
);

router.delete('/users/:id', userController.deleteUser);

export default router;
