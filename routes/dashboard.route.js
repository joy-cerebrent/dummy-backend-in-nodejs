import express from 'express';
import { generateComponents } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.post('/generate-components', generateComponents);

export default router;
