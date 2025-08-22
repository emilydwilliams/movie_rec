import { Link } from 'react-router-dom';
import { tmdbService, type TMDBMovie } from '../services/tmdb';

interface SimilarMoviesProps {
  movies: TMDBMovie[];
}

export default function SimilarMovies({ movies }: SimilarMoviesProps) {
  if (!movies.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map(movie => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="block group"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-200">
              {movie.poster_path ? (
                <img
                  src={tmdbService.getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No poster</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                <div className="p-3 text-white">
                  <h3 className="font-medium text-sm mb-1">{movie.title}</h3>
                  <div className="flex items-center text-xs">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 