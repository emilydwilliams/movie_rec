import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movieRecommendations } from '../services/movieRecommendations';
import type { TMDBMovie } from '../services/tmdb';
import type { VibeType, AgeGroup, ContentPreferences } from '../services/movieRecommendations';
import MovieCard from '../components/MovieCard';

export default function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadRecommendations() {
      try {
        // Get data from navigation state
        const familyData = location.state?.familyData;
        const selectedVibe = location.state?.selectedVibe as VibeType;
        const selectedTheme = location.state?.selectedTheme;

        if (!familyData || !selectedVibe) {
          throw new Error('Missing required preferences. Please start from the beginning.');
        }

        const ageGroups = familyData.members
          .map((member: { ageGroup: AgeGroup }) => member.ageGroup)
          .filter((group: AgeGroup | '') => group !== '');

        const recommendations = await movieRecommendations.getRecommendations(
          selectedVibe,
          ageGroups,
          familyData.preferences as ContentPreferences,
          12, // Show 12 recommendations
          selectedTheme // Pass the selected theme
        );

        setMovies(recommendations);
        setLoading(false);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [location.state]);

  const handleBack = () => {
    navigate('/theme-selector', {
      state: {
        familyData: location.state?.familyData,
        selectedVibe: location.state?.selectedVibe
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Finding the perfect movies for your family...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-medium mb-2">Oops!</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn btn-primary"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Family Movie Recommendations
        </h2>
        <p className="text-gray-600">
          Here are some movies we think your family will love
        </p>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No movies found matching your preferences. Try adjusting your criteria.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Start New Search
        </button>
      </div>
    </div>
  );
} 