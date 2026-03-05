'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlightSearch, SearchType } from '@/components/FlightSearch';
import { FlightCard } from '@/components/FlightCard';
import { FlightListItem } from '@/components/FlightListItem';
import { FlightSkeleton } from '@/components/FlightSkeleton';
import { Plane, AlertCircle, RefreshCw, SearchX, Menu, X } from 'lucide-react';
import { Flight, ApiResponse } from '@/types';

const MAX_CARDS = 4;

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('flight');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialized = useRef(false);

  const fetchFlights = async (searchQuery: string, type: SearchType) => {
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
    setSelectedFlightId(null);

    abortControllerRef.current = new AbortController();

    try {
      let url: string;
      if (type === 'departures' || type === 'arrivals') {
        url = `/api/flights?type=${type}&code=${searchQuery}`;
      } else {
        url = `/api/flights?flightNumber=${searchQuery}`;
      }

      const response = await fetch(url, {
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
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: read ?q= from URL and trigger search
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      const type: SearchType = /^[A-Z]{3}$/i.test(initialQuery) ? 'departures' : 'flight';
      setQuery(initialQuery.toUpperCase());
      setSearchType(type);
      fetchFlights(initialQuery.toUpperCase(), type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (searchQuery: string, type: SearchType) => {
    setQuery(searchQuery);
    setSearchType(type);

    if (searchQuery) {
      router.push(`/?q=${searchQuery}`, { scroll: false });
    } else {
      router.push('/', { scroll: false });
    }

    fetchFlights(searchQuery, type);
    closeDrawer();
  };

  const handleRetry = () => {
    fetchFlights(query, searchType);
  };

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setDrawerClosing(false);
    }, 250);
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    setDrawerClosing(false);
  };

  // Freeze body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const resultLabel = searchType === 'departures'
    ? `Departures from ${query}`
    : searchType === 'arrivals'
      ? `Arrivals at ${query}`
      : query.toUpperCase();

  // Split flights: first 4 as cards, rest as list
  const topFlights = flights.slice(0, MAX_CARDS);
  const remainingFlights = flights.slice(MAX_CARDS);



  /* ─── Sidebar content (shared between desktop sidebar and mobile drawer) ─── */
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25 text-white flex-shrink-0">
          <Plane className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Aero
        </h1>
      </div>
      <p className="text-slate-500 text-xs mb-6 px-1 leading-relaxed">
        Track your flight instantly. Enter a flight number or airport code.
      </p>

      {/* Search */}
      <FlightSearch
        onSearch={handleSearch}
        isLoading={isLoading}
        defaultValue={searchParams.get('q') ?? ''}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex flex-col w-[300px] lg:w-[320px] flex-shrink-0 sticky top-0 h-screen border-r border-white/[0.06] p-6 sidebar overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* ─── Mobile top bar ─── */}
      <div className="md:hidden sticky top-0 z-40 w-full flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#050A14]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center text-white">
            <Plane className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-white">Aero</span>
        </div>
        <button
          onClick={openDrawer}
          className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Open search"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ─── Mobile drawer overlay ─── */}
      {drawerOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 ${drawerClosing ? 'overlay-exit' : 'overlay-enter'}`}
            onClick={closeDrawer}
          />
          <div
            className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-[#050A14] border-r border-white/[0.06] p-6 z-50 sidebar overflow-y-auto ${drawerClosing ? 'drawer-exit' : 'drawer-enter'}`}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={closeDrawer}
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </>
      )}

      {/* ─── Main content area ─── */}
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto animate-fade-up">

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FlightSkeleton />
              <FlightSkeleton />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border-rose-500/20 max-w-lg mx-auto">
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
            <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mb-6 ring-1 ring-sky-500/20">
                <SearchX className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No flights found</h3>
              <p className="text-slate-400 max-w-sm">
                We couldn&apos;t find any active flights matching <span className="font-semibold text-sky-400 uppercase">&apos;{query}&apos;</span>. Please check and try again.
              </p>
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && flights.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-slate-400 mb-6 pl-1">
                Found {flights.length} {flights.length === 1 ? 'flight' : 'flights'} for <span className="text-sky-400">{resultLabel}</span>
              </div>

              {/* Top flights: 2×2 grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {topFlights.map((flight, i) => (
                  <FlightCard key={flight.id} flight={flight} index={i} />
                ))}
              </div>

              {/* Remaining flights: compact list */}
              {remainingFlights.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-xs font-semibold text-slate-500">
                      {remainingFlights.length} more {remainingFlights.length === 1 ? 'flight' : 'flights'}
                    </p>
                  </div>
                  <div className="max-h-[520px] overflow-y-auto sidebar">
                    {remainingFlights.map((flight) => (
                      <div key={flight.id} className="border-b border-white/[0.04] last:border-b-0">
                        <FlightListItem
                          flight={flight}
                          isSelected={selectedFlightId === flight.id}
                          onClick={() => setSelectedFlightId(
                            selectedFlightId === flight.id ? null : flight.id
                          )}
                        />
                        {selectedFlightId === flight.id && (
                          <div className="px-3 pb-3 animate-fade-up">
                            <FlightCard flight={flight} index={0} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Welcome state (no search yet) */}
          {!isLoading && !error && !query && flights.length === 0 && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-20 h-20 bg-sky-500/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-sky-500/10">
                  <Plane className="w-10 h-10 text-sky-500/40" />
                </div>
                <h2 className="text-2xl font-bold text-white/30 mb-2">Search for a flight</h2>
                <p className="text-slate-600 text-sm max-w-sm">
                  Enter a flight number like <span className="text-slate-400 font-semibold">AA123</span> or an airport code like <span className="text-slate-400 font-semibold">JFK</span> in the sidebar.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
