import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService, type TMDBMovie, type TMDBWatchProviderResult } from '../services/tmdb';
import { contentWarningService, type ContentWarning } from '../services/contentWarnings';
import VideoPlayer from '../components/VideoPlayer';
import StreamingProviders from '../components/StreamingProviders';
import SimilarMovies from '../components/SimilarMovies';
import Tooltip from '../components/Tooltip';

interface MovieDetails extends TMDBMovie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  tagline: string;
  status: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [contentWarnings, setContentWarnings] = useState<ContentWarning | null>(null);
  const [trailer, setTrailer] = useState<{ id: string; title: string } | null>(null);
  const [providers, setProviders] = useState<TMDBWatchProviderResult | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovieDetails() {
      if (!id) return;
      
      try {
        setLoading(true);
        const movieId = parseInt(id);
        
        // Fetch all movie data in parallel
        const [movieData, warnings, videos, watchProviders, similar] = await Promise.all([
          tmdbService.getMovieDetails(movieId),
          contentWarningService.getContentWarnings(movieId),
          tmdbService.getMovieVideos(movieId),
          tmdbService.getWatchProviders(movieId),
          tmdbService.getSimilarMovies(movieId)
        ]);

        setMovie(movieData as MovieDetails);
        setContentWarnings(warnings);
        setProviders(watchProviders);
        setSimilarMovies(similar);

        // Find the best available trailer
        const bestTrailer = tmdbService.getBestTrailer(videos.results);
        if (bestTrailer) {
          setTrailer({
            id: bestTrailer.key,
            title: bestTrailer.name
          });
        }
      } catch (err) {
        setError('Failed to load movie details. Please try again later.');
        console.error('Error loading movie details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading movie details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-medium mb-2">Error</h2>
          <p className="text-red-600">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative">
        {movie.backdrop_path && (
          <div className="absolute inset-0 h-[400px] overflow-hidden">
            <img
              src={tmdbService.getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title}
              className="w-full h-full object-cover filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
          </div>
        )}
        
        <div className="relative pt-[200px] pb-4 flex gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={tmdbService.getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-64 rounded-lg shadow-lg"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-xl text-gray-200 italic mb-4">
                {movie.tagline}
              </p>
            )}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white">
                {new Date(movie.release_date).getFullYear()}
              </span>
              <span className="text-white">•</span>
              <span className="text-white">
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
              <span className="text-white">•</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {movie.genres.map(genre => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            {movie.overview && (
              <div className="mt-6">
                <p className="text-gray-700 leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Trailer */}
            {trailer && (
              <div className="w-full max-w-2xl">
                <VideoPlayer videoId={trailer.id} title={trailer.title} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Content Warnings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Content Warnings</h2>
          {contentWarnings && (
            <div className="space-y-4">
              {Object.entries(contentWarnings).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-full mx-0.5 ${
                            i < value ? 'bg-primary-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {value === 0 ? 'None' : `Level ${value} out of 5`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streaming Availability */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Where to Watch</h2>
          {providers ? (
            <StreamingProviders providers={providers} />
          ) : (
            <p className="text-gray-500 text-sm">
              No streaming information available
            </p>
          )}
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900">{movie.status}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Release Date</dt>
              <dd className="text-gray-900">
                {new Date(movie.release_date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Original Language</dt>
              <dd className="text-gray-900 capitalize">
                {movie.original_language}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Production</dt>
              <dd className="text-gray-900">
                {movie.production_companies.map(company => company.name).join(', ')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <div className="mt-12">
          <SimilarMovies movies={similarMovies} />
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          Back to Movies
        </button>
      </div>
    </div>
  );
} 