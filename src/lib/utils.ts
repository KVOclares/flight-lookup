import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInMinutes } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculateDurationMinutes(
    localDep: string,
    tzDep: string,
    localArr: string,
    tzArr: string
): number {
    try {
        const depDate = fromZonedTime(localDep, tzDep);
        const arrDate = fromZonedTime(localArr, tzArr);
        return differenceInMinutes(arrDate, depDate);
    } catch (err) {
        // Falback if fromZonedTime is not the right export (e.g., older version)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { toDate } = require('date-fns-tz');
        try {
            const depDate = toDate(localDep, { timeZone: tzDep });
            const arrDate = toDate(localArr, { timeZone: tzArr });
            return differenceInMinutes(arrDate, depDate);
        } catch {
            return 0; // fallback
        }
    }
}

export function formatTimeHours(localStr: string): string {
    // We can just parse the local time string directly since it doesn't have a timezone offset
    // and format it without applying a timezone conversion to keep it "local"
    const date = new Date(localStr);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

// Format the date based on local time "Feb 21"
export function formatDateStr(localStr: string): string {
    const date = new Date(localStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}
