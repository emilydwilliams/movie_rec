import { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import type { TMDBMovie, TMDBGenre } from '../services/tmdb';

export default function MovieTest() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestData() {
      console.log('Starting to load test data...');
      try {
        // Test the cozy vibe filter
        const cozyFilter = {
          genres: [], // We'll populate this once we have genre IDs
          yearEnd: undefined,
          minRating: 7.0,
          certifications: ['G', 'PG']
        };

        // Get genres first
        console.log('Fetching genres...');
        const genreList = await tmdbService.getGenres();
        console.log('Received genres:', genreList);
        setGenres(genreList);

        // Find genre IDs for 'family' and 'fantasy'
        const familyGenre = genreList.find(g => g.name.toLowerCase() === 'family');
        const fantasyGenre = genreList.find(g => g.name.toLowerCase() === 'fantasy');

        if (familyGenre && fantasyGenre) {
          cozyFilter.genres = [familyGenre.id, fantasyGenre.id];
          console.log('Using genre IDs:', cozyFilter.genres);
        } else {
          console.warn('Could not find family or fantasy genres');
        }

        // Get movies
        console.log('Fetching movies with filter:', cozyFilter);
        const response = await tmdbService.discoverMovies(cozyFilter);
        console.log('Received movies:', response.results);
        setMovies(response.results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadTestData();
  }, []);

  console.log('Rendering with:', { loading, error, genresCount: genres.length, moviesCount: movies.length });

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">TMDB Test - Cozy Vibe Movies</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Available Genres:</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <span 
              key={genre.id}
              className="px-2 py-1 bg-gray-100 rounded-full text-sm"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map(movie => (
          <div 
            key={movie.id}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            {movie.poster_path && (
              <img
                src={tmdbService.getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold">{movie.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(movie.release_date).getFullYear()}
              </p>
              <p className="text-sm mt-2">
                Rating: {movie.vote_average.toFixed(1)}/10
              </p>
              <p className="text-sm mt-2 line-clamp-3">
                {movie.overview}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 