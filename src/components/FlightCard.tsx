import { Flight } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, PlaneTakeoff, PlaneLanding, Plane } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { fromZonedTime, toDate } from 'date-fns-tz';

interface FlightCardProps {
    flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
    const parseToUtc = (localStr: string, tz: string) => {
        try {
            if (typeof fromZonedTime === 'function') {
                return fromZonedTime(localStr, tz);
            }
            return toDate(localStr, { timeZone: tz });
        } catch {
            return new Date(localStr);
        }
    };

    const depDateUtc = parseToUtc(flight.departure.timeLocal, flight.departure.timezone);
    const arrDateUtc = parseToUtc(flight.arrival.timeLocal, flight.arrival.timezone);

    const durationMin = differenceInMinutes(arrDateUtc, depDateUtc);
    const durHours = Math.floor(durationMin / 60);
    const durMins = durationMin % 60;

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
        <div className="group glass glass-hover transition-all duration-300 rounded-2xl p-6 mb-4 overflow-hidden relative cursor-pointer">
            {/* Subtle hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/0 group-hover:from-sky-500/[0.03] group-hover:to-transparent transition-all duration-500 rounded-2xl pointer-events-none" />

            {/* Status badge */}
            <div className="absolute top-6 right-6 z-10">
                <span
                    className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase',
                        flight.status === 'On Time' && 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
                        flight.status === 'Delayed' && 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
                        flight.status === 'Landed' && 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20',
                        flight.status === 'Cancelled' && 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                    )}
                >
                    {flight.status}
                </span>
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-10 w-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 ring-1 ring-sky-500/20">
                    <Plane className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white">{flight.airline}</h3>
                    <p className="text-slate-500 text-sm font-medium">Flight {flight.flightNumber}</p>
                </div>
            </div>

            <div className="flex items-start justify-between relative z-10">
                {/* Departure */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <PlaneTakeoff className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Departure</span>
                    </div>
                    <div className="text-3xl font-extrabold text-white mb-1">{airportDepTime}</div>
                    {isDepDifferentTz && (
                        <div className="text-xs text-sky-400 font-medium mb-1">
                            {userDepTime} <span className="text-slate-500">(Your Time)</span>
                        </div>
                    )}
                    <div className="font-bold text-lg text-sky-400">{flight.departure.airportCode}</div>
                    <div className="text-sm text-slate-500">{flight.departure.city}</div>
                </div>

                {/* Duration / Route line */}
                <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4">
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        {durHours}h {durMins}m
                    </div>
                    <div className="w-full flex items-center">
                        <div className="h-[2px] w-full bg-gradient-to-r from-sky-500/40 to-sky-400/60 rounded-l-full" />
                        <Plane className="w-5 h-5 text-sky-400 mx-2 flex-shrink-0" />
                        <div className="h-[2px] w-full bg-gradient-to-r from-sky-400/60 to-sky-500/40 rounded-r-full" />
                    </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1 text-slate-500">
                        <span className="text-xs font-medium uppercase tracking-wider">Arrival</span>
                        <PlaneLanding className="h-4 w-4" />
                    </div>
                    <div className="text-3xl font-extrabold text-white mb-1">{airportArrTime}</div>
                    {isArrDifferentTz && (
                        <div className="text-xs text-sky-400 font-medium mb-1 flex justify-end gap-1">
                            <span className="text-slate-500">(Your Time)</span> {userArrTime}
                        </div>
                    )}
                    <div className="font-bold text-lg text-sky-400">{flight.arrival.airportCode}</div>
                    <div className="text-sm text-slate-500">{flight.arrival.city}</div>
                </div>
            </div>
        </div>
    );
}
