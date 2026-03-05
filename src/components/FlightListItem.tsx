'use client';

import { Flight } from '@/types';
import { cn } from '@/lib/utils';
import { Plane } from 'lucide-react';

interface FlightListItemProps {
    flight: Flight;
    isSelected?: boolean;
    onClick: () => void;
}

const STATUS_DOT: Record<string, string> = {
    'On Time': 'bg-emerald-400',
    'Delayed': 'bg-amber-400',
    'Landed': 'bg-sky-400',
    'Cancelled': 'bg-rose-400',
};

export function FlightListItem({ flight, isSelected, onClick }: FlightListItemProps) {
    const depTime = new Intl.DateTimeFormat('en-US', {
        timeZone: flight.departure.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(flight.departure.timeLocal));

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flight-list-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer',
                'border border-transparent',
                isSelected
                    ? 'bg-sky-500/10 border-sky-500/20'
                    : 'hover:border-white/[0.06]'
            )}
        >
            {/* Status dot */}
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[flight.status])} />

            {/* Airline icon */}
            <div className="w-7 h-7 bg-white/[0.04] rounded-lg flex items-center justify-center flex-shrink-0">
                <Plane className="w-3.5 h-3.5 text-sky-400" />
            </div>

            {/* Flight info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{flight.flightNumber}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-400 truncate">{flight.airline}</span>
                </div>
            </div>

            {/* Route */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 flex-shrink-0">
                <span className="text-sky-400">{flight.departure.airportCode}</span>
                <span className="text-slate-700">→</span>
                <span className="text-sky-400">{flight.arrival.airportCode}</span>
            </div>

            {/* Time */}
            <div className="text-xs font-semibold text-slate-400 flex-shrink-0 w-20 text-right">
                {depTime}
            </div>

            {/* Status */}
            <span
                className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0',
                    flight.status === 'On Time' && 'text-emerald-400 bg-emerald-500/10',
                    flight.status === 'Delayed' && 'text-amber-400 bg-amber-500/10',
                    flight.status === 'Landed' && 'text-sky-400 bg-sky-500/10',
                    flight.status === 'Cancelled' && 'text-rose-400 bg-rose-500/10',
                )}
            >
                {flight.status}
            </span>
        </button>
    );
}
