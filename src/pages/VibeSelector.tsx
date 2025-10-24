import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Import images
import cozyMagicalImg from '../assets/vibes/cozy_magical.png';
import sweetSillyImg from '../assets/vibes/sweet_silly.png';
import adventureImg from '../assets/vibes/adventure.png';
import artisticImg from '../assets/vibes/artistic.png';
import musicalsImg from '../assets/vibes/musicals.png';
import classicImg from '../assets/vibes/classic.png';
import millennialImg from '../assets/vibes/millennial.png';

type Vibe = {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
};

const VIBES: Vibe[] = [
  {
    id: 'cozy',
    name: 'Cozy and Magical',
    emoji: '🍄',
    imageUrl: cozyMagicalImg
  },
  {
    id: 'silly',
    name: 'Silly and Sweet',
    emoji: '🧁',
    imageUrl: sweetSillyImg
  },
  {
    id: 'adventure',
    name: 'Adventure Time',
    emoji: '🚀',
    imageUrl: adventureImg
  },
  {
    id: 'artsy',
    name: 'Artistic Animation',
    emoji: '🎨',
    imageUrl: artisticImg
  },
  {
    id: 'musical',
    name: 'Musical Fun',
    emoji: '🎶',
    imageUrl: musicalsImg
  },
  {
    id: 'classic',
    name: 'True Classic',
    emoji: '🎬',
    imageUrl: classicImg
  },
  {
    id: 'millennial',
    name: 'Millennial Childhood',
    emoji: '📼',
    imageUrl: millennialImg
  }
];

export default function VibeSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVibe, setSelectedVibe] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Verify we have the required data
  if (!location.state?.familyData) {
    console.error('Missing family data, redirecting to questionnaire');
    navigate('/questionnaire');
    return null;
  }

  const handleVibeSelect = (vibeId: string) => {
    setSelectedVibe(vibeId);
  };

  const handleContinue = () => {
    if (selectedVibe) {
      console.log('Selected vibe:', selectedVibe);
      navigate('/theme-selector', { 
        state: { 
          familyData: location.state.familyData,
          selectedVibe 
        } 
      });
    }
  };

  const handleBack = () => {
    navigate('/questionnaire', { 
      state: { 
        step: 2,
        familyData: location.state.familyData 
      } 
    });
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
      <div className="px-8 py-2 bg-vintage-cream z-10">
        <h2 className="text-2xl font-bold text-vintage-brown">
          What's the vibe you're looking for?
        </h2>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className={`absolute left-4 top-1/3 -translate-y-1/2 z-20 p-3 rounded-full bg-vintage-beige/90 backdrop-blur-sm shadow-lg border border-vintage-rose/30 transition-opacity duration-200 ${
            currentIndex === 0 ? 'opacity-0' : 'opacity-100'
          }`}
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="h-6 w-6 text-vintage-brown" />
        </button>
        <button
          onClick={handleNext}
          className={`absolute right-4 top-1/3 -translate-y-1/2 z-20 p-3 rounded-full bg-vintage-beige/90 backdrop-blur-sm shadow-lg border border-vintage-rose/30 transition-opacity duration-200 ${
            currentIndex === VIBES.length - 1 ? 'opacity-0' : 'opacity-100'
          }`}
          disabled={currentIndex === VIBES.length - 1}
        >
          <ChevronRightIcon className="h-6 w-6 text-vintage-brown" />
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
                  className={`group relative rounded-lg overflow-hidden transition-transform duration-200 flex flex-col items-center ${
                    selectedVibe === vibe.id ? 'ring-4 ring-vintage-sage scale-[0.98]' : 'hover:scale-[0.98]'
                  }`}
                >
                  <img
                    src={vibe.imageUrl}
                    alt={vibe.name}
                    className="w-auto h-[65vh] object-contain"
                  />
                  <p className="text-xl font-bold mt-4 text-vintage-brown drop-shadow-lg group-hover:text-vintage-sage group-hover:drop-shadow-none transition-colors duration-200">{vibe.name}</p>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 flex space-x-2">
          {VIBES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToVibe(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentIndex === index ? 'bg-vintage-sage w-4' : 'bg-vintage-brown/40'
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