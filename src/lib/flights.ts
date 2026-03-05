import { Flight, AviationStackResponse, AviationStackFlight, FlightStatus } from '@/types';

// Build a date string for today in YYYY-MM-DD format (server-side, UTC)
function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}
function tomorrowStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
}

const MOCK_FLIGHTS: Flight[] = [
    // 1. Standard flight
    {
        id: 'f1',
        airline: 'American Airlines',
        flightNumber: 'AA123',
        departure: {
            city: 'New York',
            airportCode: 'JFK',
            timeLocal: `${todayStr()}T08:00:00`,
            timezone: 'America/New_York',
            terminal: '8',
            gate: 'B22',
        },
        arrival: {
            city: 'Los Angeles',
            airportCode: 'LAX',
            timeLocal: `${todayStr()}T11:15:00`,
            timezone: 'America/Los_Angeles',
            terminal: '4',
            gate: '42A',
            baggage: '5',
        },
        status: 'On Time',
        aircraft: 'B738',
    },
    // 2. Flight crossing midnight (Departure Day !== Arrival Day)
    {
        id: 'f2',
        airline: 'United Airlines',
        flightNumber: 'UA456',
        departure: {
            city: 'Los Angeles',
            airportCode: 'LAX',
            timeLocal: `${todayStr()}T23:30:00`,
            timezone: 'America/Los_Angeles',
            terminal: '7',
            gate: '75B',
        },
        arrival: {
            city: 'Chicago',
            airportCode: 'ORD',
            timeLocal: `${tomorrowStr()}T05:30:00`,
            timezone: 'America/Chicago',
            terminal: '1',
            gate: 'C18',
            baggage: '3',
        },
        status: 'On Time',
        aircraft: 'B739',
    },
    // 3. Flight crossing international dateline & very different timezones
    {
        id: 'f3',
        airline: 'Japan Airlines',
        flightNumber: 'JL001',
        departure: {
            city: 'San Francisco',
            airportCode: 'SFO',
            timeLocal: `${todayStr()}T13:00:00`,
            timezone: 'America/Los_Angeles',
            terminal: 'I',
            gate: 'G91',
        },
        arrival: {
            city: 'Tokyo',
            airportCode: 'HND',
            timeLocal: `${tomorrowStr()}T17:15:00`,
            timezone: 'Asia/Tokyo',
            terminal: '3',
            gate: '114',
            baggage: 'B',
        },
        status: 'On Time',
        aircraft: 'B788',
    },
    // 4. Delayed flight
    {
        id: 'f4',
        airline: 'Delta Airlines',
        flightNumber: 'DL789',
        departure: {
            city: 'Atlanta',
            airportCode: 'ATL',
            timeLocal: `${todayStr()}T15:00:00`,
            timezone: 'America/New_York',
            terminal: 'S',
            gate: 'S2',
            delay: 45,
        },
        arrival: {
            city: 'Miami',
            airportCode: 'MIA',
            timeLocal: `${todayStr()}T17:00:00`,
            timezone: 'America/New_York',
            terminal: 'J',
            gate: 'J14',
        },
        status: 'Delayed',
        aircraft: 'A321',
    },
    // 5. Very long duration (10+ hours), e.g. NY to Dubai
    {
        id: 'f5',
        airline: 'Emirates',
        flightNumber: 'EK202',
        departure: {
            city: 'New York',
            airportCode: 'JFK',
            timeLocal: `${todayStr()}T22:40:00`,
            timezone: 'America/New_York',
            terminal: '4',
            gate: 'B40',
        },
        arrival: {
            city: 'Dubai',
            airportCode: 'DXB',
            timeLocal: `${tomorrowStr()}T19:30:00`,
            timezone: 'Asia/Dubai',
            terminal: '3',
            gate: 'A7',
            baggage: '7',
        },
        status: 'On Time',
        aircraft: 'A388',
    },
    // 6. Multiple flights for same flight number (e.g. multi-leg or code share)
    {
        id: 'f6',
        airline: 'American Airlines',
        flightNumber: 'AA123',
        departure: {
            city: 'Los Angeles',
            airportCode: 'LAX',
            timeLocal: `${todayStr()}T13:00:00`,
            timezone: 'America/Los_Angeles',
            terminal: '4',
            gate: '44B',
        },
        arrival: {
            city: 'Honolulu',
            airportCode: 'HNL',
            timeLocal: `${todayStr()}T16:50:00`,
            timezone: 'Pacific/Honolulu',
            terminal: '1',
            baggage: '2',
        },
        status: 'Landed',
        aircraft: 'B738',
    },
    // 7. Cancelled flight
    {
        id: 'f7',
        airline: 'Southwest Airlines',
        flightNumber: 'WN101',
        departure: {
            city: 'Dallas',
            airportCode: 'DAL',
            timeLocal: `${todayStr()}T09:00:00`,
            timezone: 'America/Chicago',
        },
        arrival: {
            city: 'Houston',
            airportCode: 'HOU',
            timeLocal: `${todayStr()}T10:15:00`,
            timezone: 'America/Chicago',
        },
        status: 'Cancelled',
        aircraft: 'B73W',
    },
    // 8. Flight over the Atlantic
    {
        id: 'f8',
        airline: 'British Airways',
        flightNumber: 'BA112',
        departure: {
            city: 'New York',
            airportCode: 'JFK',
            timeLocal: `${todayStr()}T18:30:00`,
            timezone: 'America/New_York',
            terminal: '7',
            gate: 'B22',
        },
        arrival: {
            city: 'London',
            airportCode: 'LHR',
            timeLocal: `${tomorrowStr()}T06:30:00`,
            timezone: 'Europe/London',
            terminal: '5',
            gate: 'B32',
            baggage: '12',
        },
        status: 'On Time',
        aircraft: 'B772',
    }
];

// --- Server-side Caching (Production: Redis / KV) ---
interface CacheEntry {
    data: Flight[];
    expiry: number;
}
const flightCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Mapping helper to convert AviationStack format to internal Flight format
function mapAviationStackToFlight(data: AviationStackFlight): Flight {
    // Map status
    let status: FlightStatus = 'On Time';
    if (data.flight_status === 'scheduled') status = 'On Time';
    else if (data.flight_status === 'active') status = 'On Time';
    else if (data.flight_status === 'landed') status = 'Landed';
    else if (data.flight_status === 'cancelled') status = 'Cancelled';

    // Override if delayed
    if (data.departure.delay && data.departure.delay > 15 && data.flight_status !== 'cancelled' && data.flight_status !== 'landed') {
        status = 'Delayed';
    }

    return {
        id: `${data.flight.iata}-${data.departure.scheduled}`,
        airline: data.airline.name || data.airline.iata,
        flightNumber: data.flight.iata || data.flight.number,
        departure: {
            city: data.departure.airport,
            airportCode: data.departure.iata,
            timeLocal: data.departure.estimated || data.departure.scheduled,
            timezone: data.departure.timezone,
            terminal: data.departure.terminal,
            gate: data.departure.gate,
            delay: data.departure.delay,
            actual: data.departure.actual,
        },
        arrival: {
            city: data.arrival.airport,
            airportCode: data.arrival.iata,
            timeLocal: data.arrival.estimated || data.arrival.scheduled,
            timezone: data.arrival.timezone,
            terminal: data.arrival.terminal,
            gate: data.arrival.gate,
            baggage: data.arrival.baggage,
            delay: data.arrival.delay,
            actual: data.arrival.actual,
        },
        status,
        aircraft: data.aircraft?.iata ?? null,
    };
}

export async function getFlights(flightNumber: string): Promise<Flight[]> {
    if (!flightNumber) return [];

    const normalizedQuery = flightNumber.trim().toUpperCase();

    // 1. Check Cache
    const cached = flightCache.get(normalizedQuery);
    if (cached && Date.now() < cached.expiry) {
        console.log(`[Cache Hit] Returning cached flights for ${normalizedQuery}`);
        return cached.data;
    }

    // 2. Fetch from AviationStack
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
        console.error('Error: AVIATIONSTACK_API_KEY is not set. Falling back to mock data.');
        return getMockFlights(normalizedQuery);
    }

    const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${normalizedQuery}`;

    try {
        console.log(`[API Call] Fetching AviationStack data for ${normalizedQuery}... (access_key=REDACTED)`);

        const response = await fetch(url, {
            // Revalidate every 60 seconds at the Next.js fetch layer (optional addition to in-memory)
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error(`AviationStack API returned status: ${response.status}`);
        }

        const json = await response.json() as AviationStackResponse;

        if (json.error) {
            throw new Error(`AviationStack Error: ${json.error.code} - ${json.error.message}`);
        }

        const rawData = json.data || [];

        // Map the real data to internal structure
        const mappedFlights = rawData.map(mapAviationStackToFlight);

        // Update Cache
        flightCache.set(normalizedQuery, {
            data: mappedFlights,
            expiry: Date.now() + CACHE_TTL_MS,
        });

        // 3. Fallback to Mock Data *ONLY* if Real API returned exactly 0 results (optional business rule?)
        // The prompt says "If AviationStack returns no results, show the empty state UI already in place"
        // And "If the AviationStack API is down... automatically fall back to the mock dataset"
        // So empty array = return empty array. We only fallback in the catch block on network/status errors.

        return mappedFlights;

    } catch (error) {
        // Fallback to Mock Data
        console.error('[Fallback] Failed to fetch from AviationStack, using Mock Data:', error);
        return getMockFlights(normalizedQuery);
    }
}

function getMockFlights(normalizedQuery: string): Flight[] {
    return MOCK_FLIGHTS.filter(
        (f) => f.flightNumber.toUpperCase() === normalizedQuery
    );
}

function getMockFlightsByAirport(code: string, type: 'departures' | 'arrivals'): Flight[] {
    const upper = code.toUpperCase();
    if (type === 'departures') {
        return MOCK_FLIGHTS.filter((f) => f.departure.airportCode === upper);
    }
    return MOCK_FLIGHTS.filter((f) => f.arrival.airportCode === upper);
}

export async function getFlightsByAirport(
    airportCode: string,
    type: 'departures' | 'arrivals'
): Promise<Flight[]> {
    if (!airportCode) return [];

    const normalizedCode = airportCode.trim().toUpperCase();
    const cacheKey = `${type}:${normalizedCode}`;

    // 1. Check Cache
    const cached = flightCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
        console.log(`[Cache Hit] Returning cached ${type} for ${normalizedCode}`);
        return cached.data;
    }

    // 2. Fetch from AviationStack
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
        console.error('Error: AVIATIONSTACK_API_KEY is not set. Falling back to mock data.');
        return getMockFlightsByAirport(normalizedCode, type);
    }

    const param = type === 'departures' ? 'dep_iata' : 'arr_iata';
    const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&${param}=${normalizedCode}`;

    try {
        console.log(`[API Call] Fetching AviationStack ${type} for ${normalizedCode}... (access_key=REDACTED)`);

        const response = await fetch(url, { next: { revalidate: 60 } });

        if (!response.ok) {
            throw new Error(`AviationStack API returned status: ${response.status}`);
        }

        const json = await response.json() as AviationStackResponse;

        if (json.error) {
            throw new Error(`AviationStack Error: ${json.error.code} - ${json.error.message}`);
        }

        const mappedFlights = (json.data || []).map(mapAviationStackToFlight);

        flightCache.set(cacheKey, { data: mappedFlights, expiry: Date.now() + CACHE_TTL_MS });

        return mappedFlights;
    } catch (error) {
        console.error(`[Fallback] Failed to fetch ${type} from AviationStack, using Mock Data:`, error);
        return getMockFlightsByAirport(normalizedCode, type);
    }
}
