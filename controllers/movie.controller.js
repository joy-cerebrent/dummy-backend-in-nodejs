import { movieTitles } from '../constants/movies.js';
import wait from '../utils/wait.js';

export const filterMovies = async (req, res) => {
  await wait(2);

  const { title } = req.query;
  if (!title) {
    return res.status(400).send({ message: 'Please provide a title query parameter.' });
  }

  const filteredMovies = movieTitles.filter(movie =>
    movie.toLowerCase().includes(title.toLowerCase())
  );

  if (filteredMovies.length === 0) {
    return res.status(404).send({ message: 'No movies found matching your query.' });
  }

  res.json(filteredMovies);
};
