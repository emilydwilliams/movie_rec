import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Vibe = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

const VIBES: Vibe[] = [
  {
    id: 'cozy',
    name: 'Cozy and Magical',
    description: 'Warm, enchanting stories that feel like a hug',
    emoji: '🍄'
  },
  {
    id: 'silly',
    name: 'Silly and Sweet',
    description: 'Light-hearted fun and laughs for everyone',
    emoji: '🧁'
  },
  {
    id: 'adventure',
    name: 'Adventure Time',
    description: 'Epic journeys and exciting discoveries',
    emoji: '🚀'
  },
  {
    id: 'artsy',
    name: 'Artsy and Beautiful',
    description: 'Visually stunning and imaginative tales',
    emoji: '🎨'
  },
  {
    id: 'musical',
    name: 'Musical Fun',
    description: 'Toe-tapping tunes and dancing delight',
    emoji: '🎶'
  },
  {
    id: 'classic',
    name: 'True Classic',
    description: 'Timeless favorites from before the 1980s',
    emoji: '🎬'
  },
  {
    id: 'millennial',
    name: 'Millennial Childhood',
    description: 'Nostalgic hits from the 80s, 90s, and 00s',
    emoji: '📼'
  }
];

export default function VibeSelector() {
  const navigate = useNavigate();
  const [selectedVibe, setSelectedVibe] = useState<string>('');

  const handleVibeSelect = (vibeId: string) => {
    setSelectedVibe(vibeId);
  };

  const handleContinue = () => {
    if (selectedVibe) {
      console.log('Selected vibe:', selectedVibe);
      navigate('/theme-selector');
    }
  };

  const handleBack = () => {
    navigate('/questionnaire', { state: { step: 2 } });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What's the vibe you're looking for?
        </h2>
        <p className="text-gray-600">
          Choose the mood that matches your perfect movie night
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {VIBES.map((vibe) => (
          <button
            key={vibe.id}
            onClick={() => handleVibeSelect(vibe.id)}
            className={`
              p-6 rounded-xl text-left transition-all duration-200
              ${
                selectedVibe === vibe.id
                  ? 'bg-white border-2 border-primary-500 shadow-lg'
                  : 'bg-white border border-gray-200 hover:border-primary-300 hover:shadow'
              }
            `}
          >
            <div className="text-4xl mb-3">{vibe.emoji}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {vibe.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {vibe.description}
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
          disabled={!selectedVibe}
        >
          Next: Choose Theme
        </button>
      </div>
    </div>
  );
} 