import { Flight, AviationStackResponse, AviationStackFlight, FlightStatus } from '@/types';

const MOCK_FLIGHTS: Flight[] = [
    // 1. Standard flight
    {
        id: 'f1',
        airline: 'American Airlines',
        flightNumber: 'AA123',
        departure: {
            city: 'New York',
            airportCode: 'JFK',
            timeLocal: '2026-02-21T08:00:00',
            timezone: 'America/New_York',
        },
        arrival: {
            city: 'Los Angeles',
            airportCode: 'LAX',
            timeLocal: '2026-02-21T11:15:00',
            timezone: 'America/Los_Angeles',
        },
        status: 'On Time',
    },
    // 2. Flight crossing midnight (Departure Day !== Arrival Day)
    {
        id: 'f2',
        airline: 'United Airlines',
        flightNumber: 'UA456',
        departure: {
            city: 'Los Angeles',
            airportCode: 'LAX',
            timeLocal: '2026-02-21T23:30:00',
            timezone: 'America/Los_Angeles',
        },
        arrival: {
            city: 'Chicago',
            airportCode: 'ORD',
            timeLocal: '2026-02-22T05:30:00',
            timezone: 'America/Chicago',
        },
        status: 'On Time',
    },
    // 3. Flight crossing international dateline & very different timezones
    {
        id: 'f3',
        airline: 'Japan Airlines',
        flightNumber: 'JL001',
        departure: {
            city: 'San Francisco',
            airportCode: 'SFO',
            timeLocal: '2026-02-21T13:00:00',
            timezone: 'America/Los_Angeles',
        },
        arrival: {
            city: 'Tokyo',
            airportCode: 'HND',
            timeLocal: '2026-02-22T17:15:00', // Lands next day afternoon
            timezone: 'Asia/Tokyo',
        },
        status: 'On Time',
    },
    // 4. Delayed flight
    {
        id: 'f4',
        airline: 'Delta Airlines',
        flightNumber: 'DL789',
        departure: {
            city: 'Atlanta',
            airportCode: 'ATL',
            timeLocal: '2026-02-21T15:00:00',
            timezone: 'America/New_York',
        },
        arrival: {
            city: 'Miami',
            airportCode: 'MIA',
            timeLocal: '2026-02-21T17:00:00',
            timezone: 'America/New_York',
        },
        status: 'Delayed',
    },
    // 5. Very long duration (10+ hours), e.g. NY to Dubai
    {
        id: 'f5',
        airline: 'Emirates',
        flightNumber: 'EK202',
        departure: {
            city: 'New York',
            airportCode: 'JFK',
            timeLocal: '2026-02-21T22:40:00',
            timezone: 'America/New_York',
        },
        arrival: {
            city: 'Dubai',
            airportCode: 'DXB',
            timeLocal: '2026-02-22T19:30:00',
            timezone: 'Asia/Dubai',
        },
        status: 'On Time',
    },
    // 6. Multiple flights for same flight number (e.g. multi-leg or code share)
    {
        id: 'f6',
        airline: 'American Airlines',
        flightNumber: 'AA123',
        departure: {
            city: 'Los Angeles',
            airportCode: 'LAX',
            timeLocal: '2026-02-21T13:00:00',
            timezone: 'America/Los_Angeles',
        },
        arrival: {
            city: 'Honolulu',
            airportCode: 'HNL',
            timeLocal: '2026-02-21T16:50:00',
            timezone: 'Pacific/Honolulu',
        },
        status: 'Landed',
    },
    // 7. Cancelled flight
    {
        id: 'f7',
        airline: 'Southwest Airlines',
        flightNumber: 'WN101',
        departure: {
            city: 'Dallas',
            airportCode: 'DAL',
            timeLocal: '2026-02-21T09:00:00',
            timezone: 'America/Chicago',
        },
        arrival: {
            city: 'Houston',
            airportCode: 'HOU',
            timeLocal: '2026-02-21T10:15:00',
            timezone: 'America/Chicago',
        },
        status: 'Cancelled',
    },
    // 8. Flight over the Atlantic
    {
        id: 'f8',
        airline: 'British Airways',
        flightNumber: 'BA112',
        departure: {
            city: 'New York',
            airportCode: 'JFK',
            timeLocal: '2026-02-21T18:30:00',
            timezone: 'America/New_York',
        },
        arrival: {
            city: 'London',
            airportCode: 'LHR',
            timeLocal: '2026-02-22T06:30:00',
            timezone: 'Europe/London',
        },
        status: 'On Time',
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
    else if (data.flight_status === 'active') status = 'On Time'; // Can enhance logic with 'delay' field if needed
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
        },
        arrival: {
            city: data.arrival.airport,
            airportCode: data.arrival.iata,
            timeLocal: data.arrival.estimated || data.arrival.scheduled,
            timezone: data.arrival.timezone,
        },
        status,
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
