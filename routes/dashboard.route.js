import express from 'express';
import { generateComponents, generateForm } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.post('/generate-components', generateComponents);
router.post('/generate-form', generateForm);

export default router;
