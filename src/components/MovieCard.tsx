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
      className="block bg-vintage-beige rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col transform hover:scale-[1.02] border border-vintage-rose/20"
    >
      <div className="w-full aspect-[2/3] bg-vintage-cream flex items-center justify-center">
        {movie.poster_path ? (
          <img
            src={tmdbService.getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-vintage-brown/60">No poster available</span>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-xl mb-2 text-vintage-brown">{movie.title}</h3>
        <p className="text-sm text-vintage-brown/60 mb-3">
          {new Date(movie.release_date).getFullYear()}
        </p>
        
        {/* TMDB Rating and Content Rating */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-vintage-sage/20 text-vintage-brown border border-vintage-sage/30">
            ★ {movie.vote_average.toFixed(1)}
          </span>
          {movie.certification && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-vintage-rose/20 text-vintage-brown border border-vintage-rose/30">
              {movie.certification}
            </span>
          )}
        </div>

        <p className="text-base text-vintage-brown/80 flex-1">
          {truncateText(movie.overview)}
        </p>
      </div>
    </Link>
  );
} 