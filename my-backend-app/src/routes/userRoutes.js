import express from 'express';
import UserController from '../controllers/userController';

const router = express.Router();
const userController = new UserController();

const setUserRoutes = (app) => {
    router.get('/users/:id', userController.getUser);
    router.post('/users', userController.createUser);
    router.put('/users/:id', userController.updateUser);

    app.use('/api', router);
};

export default setUserRoutes;