import express from 'express';
import {
  generateComponents,
  updateComponents,
  generateForm,
  saveFormData
} from '../controllers/dashboard.controller.js';

const router = express.Router();

export default (io) => {
  router.post('/generate-components', generateComponents);
  router.post('/update-components', (req, res) => updateComponents(req, res, io));
  router.post('/generate-form', generateForm);
  router.post('/save-data', saveFormData);

  return router;
};