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
      <div className="px-8 py-4 bg-white/80 backdrop-blur-sm z-10">
        <h2 className="text-2xl font-bold text-gray-900">
          What's the vibe you're looking for?
        </h2>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition-opacity duration-200 ${
            currentIndex === 0 ? 'opacity-0' : 'opacity-100'
          }`}
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
        </button>
        <button
          onClick={handleNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition-opacity duration-200 ${
            currentIndex === VIBES.length - 1 ? 'opacity-0' : 'opacity-100'
          }`}
          disabled={currentIndex === VIBES.length - 1}
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-800" />
        </button>

        {/* Vibe Carousel */}
        <div
          ref={scrollContainerRef}
          className="h-full flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          onScroll={handleScroll}
        >
          {VIBES.map((vibe, index) => (
            <div
              key={vibe.id}
              className="w-full h-full flex-none snap-center flex items-center justify-center p-8"
            >
              <button
                onClick={() => handleVibeSelect(vibe.id)}
                className={`relative group ${
                  selectedVibe === vibe.id ? 'ring-4 ring-primary-500' : ''
                }`}
              >
                <img
                  src={vibe.imageUrl}
                  alt={vibe.name}
                  className="max-h-[calc(100vh-12rem)] w-auto object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-left transform transition-transform duration-300">
                  <div className="flex items-center">
                    <span className="text-5xl mr-4">{vibe.emoji}</span>
                    <h3 className={`text-3xl font-bold text-white ${vibe.titleColor}`}>
                      {vibe.name}
                    </h3>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {VIBES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToVibe(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur-sm z-10 flex justify-between items-center">
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
  );
} 