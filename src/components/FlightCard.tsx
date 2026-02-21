import { Flight } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, PlaneTakeoff, PlaneLanding, Plane } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { fromZonedTime, toDate } from 'date-fns-tz';

interface FlightCardProps {
    flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
    // Safe parsing helper due to date-fns-tz version exports
    const parseToUtc = (localStr: string, tz: string) => {
        try {
            if (typeof fromZonedTime === 'function') {
                return fromZonedTime(localStr, tz);
            }
            return toDate(localStr, { timeZone: tz });
        } catch {
            // Fallback native
            return new Date(localStr);
        }
    };

    const depDateUtc = parseToUtc(flight.departure.timeLocal, flight.departure.timezone);
    const arrDateUtc = parseToUtc(flight.arrival.timeLocal, flight.arrival.timezone);

    const durationMin = differenceInMinutes(arrDateUtc, depDateUtc);
    const durHours = Math.floor(durationMin / 60);
    const durMins = durationMin % 60;

    // Format explicitly in airport timezone
    const airportDepTime = new Intl.DateTimeFormat('en-US', {
        timeZone: flight.departure.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(depDateUtc);

    const airportArrTime = new Intl.DateTimeFormat('en-US', {
        timeZone: flight.arrival.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(arrDateUtc);

    // User browser timezone
    const userDepTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(depDateUtc);

    const userArrTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(arrDateUtc);

    const isDepDifferentTz = airportDepTime !== userDepTime;
    const isArrDifferentTz = airportArrTime !== userArrTime;

    return (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-3xl p-6 mb-4 overflow-hidden relative group">
            {/* Flight status indicator at the top right */}
            <div className="absolute top-6 right-6">
                <span
                    className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase',
                        flight.status === 'On Time' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        flight.status === 'Delayed' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        flight.status === 'Landed' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        flight.status === 'Cancelled' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    )}
                >
                    {flight.status}
                </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500">
                    <Plane className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg dark:text-zinc-100">{flight.airline}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Flight {flight.flightNumber}</p>
                </div>
            </div>

            <div className="flex items-start justify-between relative">
                {/* Departure */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 text-zinc-400">
                        <PlaneTakeoff className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Departure</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-800 dark:text-zinc-100 mb-1">{airportDepTime}</div>
                    {isDepDifferentTz && (
                        <div className="text-xs text-indigo-500 font-medium mb-1">
                            {userDepTime} <span className="text-zinc-400">(Your Time)</span>
                        </div>
                    )}
                    <div className="font-bold text-lg text-zinc-700 dark:text-zinc-300">{flight.departure.airportCode}</div>
                    <div className="text-sm text-zinc-500">{flight.departure.city}</div>
                </div>

                {/* Duration / Route line */}
                <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4">
                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        {durHours}h {durMins}m
                    </div>
                    <div className="w-full flex items-center">
                        <div className="h-[2px] w-full bg-zinc-200 dark:bg-zinc-800 rounded-l-full" />
                        <Plane className="w-5 h-5 text-indigo-400 mx-2 flex-shrink-0" />
                        <div className="h-[2px] w-full bg-zinc-200 dark:bg-zinc-800 rounded-r-full" />
                    </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1 text-zinc-400">
                        <span className="text-xs font-medium uppercase tracking-wider">Arrival</span>
                        <PlaneLanding className="h-4 w-4" />
                    </div>
                    <div className="text-3xl font-black text-zinc-800 dark:text-zinc-100 mb-1">{airportArrTime}</div>
                    {isArrDifferentTz && (
                        <div className="text-xs text-indigo-500 font-medium mb-1 flex justify-end gap-1">
                            <span className="text-zinc-400">(Your Time)</span> {userArrTime}
                        </div>
                    )}
                    <div className="font-bold text-lg text-zinc-700 dark:text-zinc-300">{flight.arrival.airportCode}</div>
                    <div className="text-sm text-zinc-500">{flight.arrival.city}</div>
                </div>
            </div>
        </div>
    );
}
