import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type Theme = {
  id: string;
  name: string;
  imageUrl: string;
};

const THEMES: Theme[] = [
  {
    id: 'animals',
    name: 'Animal Friends',
    imageUrl: '/src/assets/themes/animal_friends.jpg'
  },
  {
    id: 'sports',
    name: 'Sports',
    imageUrl: '/src/assets/themes/sports.jpg'
  },
  {
    id: 'summer',
    name: 'Summer Fun',
    imageUrl: '/src/assets/themes/summer_fun.jpg'
  },
  {
    id: 'halloween',
    name: 'Halloween',
    imageUrl: '/src/assets/themes/halloween.jpg'
  },
  {
    id: 'christmas',
    name: 'Christmas',
    imageUrl: '/src/assets/themes/christmas.jpg'
  },
  {
    id: 'winter',
    name: 'Snow Day',
    imageUrl: '/src/assets/themes/snow_day.jpg'
  }
];

export default function ThemeSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  // Verify we have the required data
  if (!location.state?.familyData || !location.state?.selectedVibe) {
    console.error('Missing required data, redirecting to questionnaire');
    navigate('/questionnaire');
    return null;
  }

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleContinue = () => {
    if (selectedTheme) {
      console.log('Selected theme:', selectedTheme);
      navigate('/recommendations', { 
        state: { 
          familyData: location.state.familyData,
          selectedVibe: location.state.selectedVibe,
          selectedTheme 
        } 
      });
    }
  };

  const handleBack = () => {
    navigate('/vibe-selector', { 
      state: { 
        familyData: location.state.familyData 
      } 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Any specific themes you're interested in?
        </h2>
        <p className="text-gray-600">
          Choose a theme to help us find the perfect movie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`
              relative h-48 rounded-xl overflow-hidden transition-all duration-200
              ${
                selectedTheme === theme.id
                  ? 'ring-4 ring-primary-500 scale-[0.98]'
                  : 'hover:scale-[0.98]'
              }
            `}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${theme.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-colors duration-200" />
            <h3 className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
              {theme.name}
            </h3>
          </button>
        ))}
        
        {/* No Theme Option */}
        <button
          onClick={() => handleThemeSelect('none')}
          className={`
            relative h-48 rounded-xl transition-all duration-200 border-2 border-dashed border-gray-300
            ${
              selectedTheme === 'none'
                ? 'ring-4 ring-primary-500 scale-[0.98] bg-gray-50'
                : 'hover:scale-[0.98] hover:bg-gray-50'
            }
          `}
        >
          <h3 className="text-2xl font-bold text-gray-500">
            No Theme
          </h3>
        </button>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="btn btn-primary"
          disabled={!selectedTheme}
        >
          Find Movies
        </button>
      </div>
    </div>
  );
} 