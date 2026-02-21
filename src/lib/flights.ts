import { Flight } from '@/types';

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
    // 6. Multiple flights for same flight number (e.g. multi-leg or code share, just to test multiple results)
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
];

export async function getFlights(flightNumber: string): Promise<Flight[]> {
    // Simulate network delay of 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!flightNumber) {
        return [];
    }

    const normalizedQuery = flightNumber.trim().toUpperCase();

    return MOCK_FLIGHTS.filter(
        (f) => f.flightNumber.toUpperCase() === normalizedQuery
    );
}
