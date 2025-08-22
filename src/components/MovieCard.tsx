import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import type { TMDBMovie } from '../services/tmdb';

interface MovieCardProps {
  movie: TMDBMovie;
}

const truncateText = (text: string, maxLength: number = 500) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link 
      to={`/movie/${movie.id}`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col transform hover:scale-[1.02]"
    >
      {movie.poster_path ? (
        <img
          src={tmdbService.getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
      ) : (
        <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No poster available</span>
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-xl mb-2">{movie.title}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {new Date(movie.release_date).getFullYear()}
        </p>
        
        {/* TMDB Rating */}
        <div className="flex items-center mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            ★ {movie.vote_average.toFixed(1)}
          </span>
        </div>

        <p className="text-base text-gray-600 flex-1">
          {truncateText(movie.overview)}
        </p>
      </div>
    </Link>
  );
} 