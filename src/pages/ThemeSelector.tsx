import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Theme = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

const THEMES: Theme[] = [
  {
    id: 'animals',
    name: 'Animal Friends',
    description: 'Movies featuring lovable animal companions',
    emoji: '🐾'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Inspiring stories of athletic achievement',
    emoji: '⚽'
  },
  {
    id: 'winter',
    name: 'Snow Day',
    description: 'Cozy winter and snowy weather adventures',
    emoji: '❄️'
  },
  {
    id: 'summer',
    name: 'Summer Fun',
    description: 'Sun-filled adventures and vacation vibes',
    emoji: '☀️'
  },
  {
    id: 'autumn',
    name: 'Autumn Magic',
    description: 'Fall festivities and magical moments',
    emoji: '🍁'
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Holiday cheer and festive celebrations',
    emoji: '🎄'
  },
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'Not-too-spooky fun for the whole family',
    emoji: '🎃'
  }
];

export default function ThemeSelector() {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleContinue = () => {
    if (selectedTheme) {
      console.log('Selected theme:', selectedTheme);
      navigate('/recommendations');
    }
  };

  const handleBack = () => {
    navigate('/vibe-selector');
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
              p-6 rounded-xl text-left transition-all duration-200
              ${
                selectedTheme === theme.id
                  ? 'bg-white border-2 border-primary-500 shadow-lg'
                  : 'bg-white border border-gray-200 hover:border-primary-300 hover:shadow'
              }
            `}
          >
            <div className="text-4xl mb-3">{theme.emoji}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {theme.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {theme.description}
            </p>
          </button>
        ))}
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