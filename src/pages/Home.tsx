import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-vintage-brown mb-8">
        Welcome to Family Movie Night
      </h1>
      <p className="text-xl text-vintage-brown/80 mb-8 max-w-2xl text-center">
        Find the perfect movie for your family's next movie night! We'll help you discover age-appropriate content that everyone will enjoy.
      </p>
      <Link to="/questionnaire" className="btn btn-primary text-lg">
        Get Started
      </Link>
    </div>
  );
} 