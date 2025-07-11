import { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { movieRecommendations, type TMDBMovie, type VibeType, type AgeGroup } from '../services/movieRecommendations';

export default function MovieTest() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('cozy');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const VIBES: VibeType[] = ['cozy', 'silly', 'adventure', 'artsy', 'musical', 'classic', 'millennial'];

  useEffect(() => {
    async function loadTestData() {
      console.log('Loading recommendations for vibe:', selectedVibe);
      try {
        setLoading(true);
        setError('');

        // Test with a family that has kids of different ages
        const ageGroups: AgeGroup[] = ['elementary', 'teens'];
        
        // Test with some content preferences
        const preferences = {
          avoidGriefLoss: true,
          avoidSubstances: true,
          avoidRomanceSexuality: false,
          avoidViolenceScare: true,
          avoidProfanity: true,
          avoidProductPlacement: false
        };

        const recommendations = await movieRecommendations.getRecommendations(
          selectedVibe,
          ageGroups,
          preferences,
          12 // Get more movies for testing
        );

        console.log(`Found ${recommendations.length} recommendations`);
        setMovies(recommendations);
        setLoading(false);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadTestData();
  }, [selectedVibe]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">TMDB Test - Movie Recommendations</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {VIBES.map(vibe => (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(vibe)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedVibe === vibe 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              {vibe.charAt(0).toUpperCase() + vibe.slice(1)}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Testing with: Elementary + Teen ages, avoiding grief/substances/violence/profanity
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {movies.map(movie => (
          <div 
            key={movie.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white"
          >
            {movie.poster_path ? (
              <img
                src={tmdbService.getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No poster available</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold">{movie.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(movie.release_date).getFullYear()}
              </p>
              <p className="text-sm mt-2">
                Rating: {movie.vote_average.toFixed(1)}/10
              </p>
              <p className="text-sm mt-2 line-clamp-3 text-gray-600">
                {movie.overview}
              </p>
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No movies found for the selected criteria
        </div>
      )}
    </div>
  );
} 