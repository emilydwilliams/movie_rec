import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Vibe = {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
  titleColor: string;
};

const VIBES: Vibe[] = [
  {
    id: 'cozy',
    name: 'Cozy and Magical',
    emoji: '🍄',
    imageUrl: '/src/assets/vibes/cozy_magical.png',
    titleColor: 'text-emerald-700'
  },
  {
    id: 'silly',
    name: 'Silly and Sweet',
    emoji: '🧁',
    imageUrl: '/src/assets/vibes/sweet_silly.png',
    titleColor: 'text-pink-500'
  },
  {
    id: 'adventure',
    name: 'Adventure Time',
    emoji: '🚀',
    imageUrl: '/src/assets/vibes/adventure.png',
    titleColor: 'text-blue-600'
  },
  {
    id: 'artsy',
    name: 'Artsy and Beautiful',
    emoji: '🎨',
    imageUrl: '/src/assets/vibes/artistic.png',
    titleColor: 'text-purple-600'
  },
  {
    id: 'musical',
    name: 'Musical Fun',
    emoji: '🎶',
    imageUrl: '/src/assets/vibes/musicals.png',
    titleColor: 'text-yellow-600'
  },
  {
    id: 'classic',
    name: 'True Classic',
    emoji: '🎬',
    imageUrl: '/src/assets/vibes/classic.png',
    titleColor: 'text-gray-700'
  },
  {
    id: 'millennial',
    name: 'Millennial Childhood',
    emoji: '📼',
    imageUrl: '/src/assets/vibes/millennial.png',
    titleColor: 'text-indigo-600'
  }
];

export default function VibeSelector() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVibe, setSelectedVibe] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const scrollToVibe = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const vibeElement = container.children[index] as HTMLElement;
      container.scrollTo({
        left: vibeElement.offsetLeft,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < VIBES.length - 1) {
      scrollToVibe(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToVibe(currentIndex - 1);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-8 py-2 bg-gray-50 z-10">
        <h2 className="text-2xl font-bold text-gray-900">
          What's the vibe you're looking for?
        </h2>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gray-50/80 backdrop-blur-sm shadow-lg transition-opacity duration-200 ${
            currentIndex === 0 ? 'opacity-0' : 'opacity-100'
          }`}
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
        </button>
        <button
          onClick={handleNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gray-50/80 backdrop-blur-sm shadow-lg transition-opacity duration-200 ${
            currentIndex === VIBES.length - 1 ? 'opacity-0' : 'opacity-100'
          }`}
          disabled={currentIndex === VIBES.length - 1}
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-800" />
        </button>

        {/* Image Carousel */}
        <div 
          className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
          ref={scrollContainerRef}
        >
          {VIBES.map((vibe, index) => (
            <div
              key={vibe.id}
              className="flex-none w-full h-full snap-center"
            >
              <div className="h-full flex items-start justify-center px-4 pt-4">
                <button
                  onClick={() => handleVibeSelect(vibe.id)}
                  className={`relative rounded-lg overflow-hidden transition-transform duration-200 ${
                    selectedVibe === vibe.id ? 'ring-4 ring-primary-500 scale-[0.98]' : 'hover:scale-[0.98]'
                  }`}
                >
                  <img
                    src={vibe.imageUrl}
                    alt={vibe.name}
                    className="w-auto h-[65vh] object-contain"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex space-x-2">
          {VIBES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToVibe(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentIndex === index ? 'bg-primary-500 w-4' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute bottom-24 left-0 right-0 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between">
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
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 