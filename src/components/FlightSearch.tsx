'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Regex: 2-3 letters followed by 1-4 digits
const FLIGHT_REGEX = /^[A-Z]{2,3}\d{1,4}$/i;

interface FlightSearchProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

export function FlightSearch({ onSearch, isLoading }: FlightSearchProps) {
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Upper case and strip whitespace
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
        }, 600); // Debounce duration
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

    return (
        <div className="w-full max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSubmit} className="relative group">
                <div
                    className={cn(
                        "flex items-center bg-white dark:bg-zinc-900 border-[3px] rounded-2xl p-2 transition-all duration-300 shadow-sm",
                        error ? "border-rose-400" : "border-indigo-100 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:shadow-indigo-500/20 focus-within:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                    )}
                >
                    <div className="pl-4 pr-3 text-zinc-400">
                        <Search className={cn("w-6 h-6", isLoading ? "animate-pulse text-indigo-500" : "")} />
                    </div>
                    <input
                        type="text"
                        value={inputVal}
                        onChange={handleChange}
                        placeholder="Enter flight number (e.g. AA123)"
                        className="flex-1 bg-transparent border-none outline-none text-xl font-semibold dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 placeholder:font-medium placeholder:uppercase"
                    />
                    {inputVal && (
                        <button
                            type="button"
                            onClick={clearInput}
                            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!inputVal || isLoading || !!error}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors ml-2"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {error && (
                    <div className="absolute top-full left-0 mt-2 text-sm font-semibold text-rose-500 pl-4 w-full text-left">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
