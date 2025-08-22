import { tmdbService, type TMDBWatchProviderResult } from '../services/tmdb';

interface StreamingProvidersProps {
  providers: TMDBWatchProviderResult;
}

export default function StreamingProviders({ providers }: StreamingProvidersProps) {
  const sections: Array<{ key: keyof TMDBWatchProviderResult; label: string }> = [
    { key: 'flatrate', label: 'Streaming' },
    { key: 'free', label: 'Free' },
    { key: 'rent', label: 'Rent' },
    { key: 'buy', label: 'Buy' }
  ];

  return (
    <div className="space-y-4">
      <a
        href={providers.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
      >
        View on TMDB
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h6.586L9.293 5.707a1 1 0 111.414-1.414l4.999 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L12.586 11H6a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </a>

      {sections.map(({ key, label }) => {
        const list = providers[key as keyof TMDBWatchProviderResult] as TMDBWatchProviderResult[keyof TMDBWatchProviderResult];
        if (!Array.isArray(list) || list.length === 0) return null;

        return (
          <div key={key}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
            <div className="flex flex-wrap gap-2">
              {list.map(p => (
                <div key={(p as any).provider_id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                  {(p as any).logo_path ? (
                    <img
                      src={tmdbService.getImageUrl((p as any).logo_path) || ''}
                      alt={(p as any).provider_name}
                      className="h-6 w-6 rounded"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded bg-gray-200" />
                  )}
                  <span className="text-sm text-gray-700">{(p as any).provider_name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
