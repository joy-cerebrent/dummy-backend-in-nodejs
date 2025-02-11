import express from 'express';
import { getSocketData, updateSocketData } from '../controllers/socket.controller.js';

const router = express.Router();

export default (io) => {
  router.get('/data', getSocketData);
  router.post('/data', (req, res) => updateSocketData(req, res, io));

  return router;
};
