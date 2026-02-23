'use client';

import { useState, useRef } from 'react';
import { FlightSearch } from '@/components/FlightSearch';
import { FlightCard } from '@/components/FlightCard';
import { FlightSkeleton } from '@/components/FlightSkeleton';
import { Plane, AlertCircle, RefreshCw, SearchX } from 'lucide-react';
import { Flight, ApiResponse } from '@/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFlights = async (searchQuery: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!searchQuery) {
      setFlights([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFlights([]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/flights?flightNumber=${searchQuery}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const json = (await response.json()) as ApiResponse<Flight[]>;

      if (json.error) {
        throw new Error(json.error);
      }

      if (json.data) {
        setFlights(json.data);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    fetchFlights(searchQuery);
  };

  const handleRetry = () => {
    fetchFlights(query);
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-24 pb-12 px-4 sm:px-6 relative">
      <div className="w-full max-w-4xl flex flex-col items-center animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/25 text-white">
            <Plane className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Aero
          </h1>
        </div>
        <p className="text-slate-400 text-lg mb-12 text-center max-w-lg">
          Track your flight instantly. Enter your flight number to get real-time status and timezone conversions.
        </p>

        {/* Search Component */}
        <FlightSearch onSearch={handleSearch} isLoading={isLoading} />

        {/* Status / Content Area */}
        <div className="w-full max-w-2xl mt-4">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-4">
              <FlightSkeleton />
              <FlightSkeleton />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border-rose-500/20">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mb-4 ring-1 ring-rose-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 glass glass-hover transition-all duration-200 px-6 py-2.5 rounded-xl font-semibold text-slate-300 cursor-pointer hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && query && flights.length === 0 && (
            <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mb-6 ring-1 ring-sky-500/20">
                <SearchX className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No flights found</h3>
              <p className="text-slate-400 max-w-sm">
                We couldn&apos;t find any active flights matching <span className="font-semibold text-sky-400 uppercase">&apos;{query}&apos;</span>. Please check the flight number and try again.
              </p>
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && flights.length > 0 && (
            <div className="space-y-4 animate-fade-up">
              <div className="text-sm font-semibold text-slate-400 mb-4 pl-2">
                Found {flights.length} {flights.length === 1 ? 'flight' : 'flights'} for <span className="text-sky-400">{query.toUpperCase()}</span>
              </div>
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
