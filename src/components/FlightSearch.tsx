'use client';

import { useState, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const FLIGHT_REGEX = /^[A-Z]{2,3}\d{1,4}$/i;

const SAMPLE_FLIGHTS = ['AA123', 'UA456', 'JL001', 'DL789', 'EK202', 'WN101', 'BA112'];

interface FlightSearchProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

export function FlightSearch({ onSearch, isLoading }: FlightSearchProps) {
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/\s/g, '');
        setInputVal(value);
        setError('');

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!value) {
            onSearch('');
            return;
        }

        timeoutRef.current = setTimeout(() => {
            if (FLIGHT_REGEX.test(value)) {
                onSearch(value);
            } else {
                setError('Please enter a valid flight number (e.g. AA123)');
            }
        }, 600);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (!inputVal) return;

        if (FLIGHT_REGEX.test(inputVal)) {
            onSearch(inputVal);
        } else {
            setError('Please enter a valid flight number (e.g. AA123)');
        }
    };

    const clearInput = () => {
        setInputVal('');
        setError('');
        onSearch('');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleSampleClick = (flightNo: string) => {
        setInputVal(flightNo);
        setError('');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onSearch(flightNo);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSubmit} className="relative group mb-6">
                <div
                    className={cn(
                        "flex items-center backdrop-blur-xl border-2 rounded-2xl p-2 transition-all duration-300",
                        "bg-white/[0.04]",
                        error
                            ? "border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                            : "border-white/[0.08] focus-within:border-sky-500/50 focus-within:shadow-[0_0_30px_rgba(14,165,233,0.12)]"
                    )}
                >
                    <div className="pl-4 pr-3 text-slate-500">
                        <Search className={cn("w-6 h-6 transition-colors duration-200", isLoading ? "animate-pulse text-sky-400" : "")} />
                    </div>
                    <input
                        type="text"
                        value={inputVal}
                        onChange={handleChange}
                        placeholder="Enter flight number (e.g. AA123)"
                        className="flex-1 bg-transparent border-none outline-none text-xl font-semibold text-white placeholder:text-slate-600 placeholder:font-medium placeholder:uppercase"
                        id="flight-search-input"
                    />
                    {inputVal && (
                        <button
                            type="button"
                            onClick={clearInput}
                            className="p-2 text-slate-500 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!inputVal || isLoading || !!error}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white px-7 py-3 rounded-xl font-bold transition-all duration-200 ml-2 cursor-pointer shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
                        id="flight-search-submit"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {error && (
                    <div className="absolute top-full left-0 mt-2 text-sm font-semibold text-rose-400 pl-4 w-full text-left">
                        {error}
                    </div>
                )}
            </form>

            {/* Try a Sample Search Panel */}
            <div className="glass rounded-xl p-4 mt-8">
                <p className="text-sm font-semibold text-slate-500 mb-3 ml-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>API unavailable? Try these sample flights:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                    {SAMPLE_FLIGHTS.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => handleSampleClick(f)}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:border-sky-500/30 hover:bg-white/[0.08] text-slate-300 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:text-white"
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
