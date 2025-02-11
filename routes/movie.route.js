import express from 'express';
import { filterMovies } from '../controllers/movie.controller.js';

const router = express.Router();

router.get('/filter', filterMovies);

export default router;
