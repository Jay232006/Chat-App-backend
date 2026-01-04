import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();
//diffferent auth method to be added 

router.post('/register', register);

router.post('/login', login);

export default router;