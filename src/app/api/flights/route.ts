import { NextRequest, NextResponse } from 'next/server';
import { getFlights } from '@/lib/flights';
import { ApiResponse, Flight } from '@/types';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const flightNumber = searchParams.get('flightNumber');

    if (!flightNumber) {
        return NextResponse.json(
            { error: 'Flight number is required' } as ApiResponse<Flight[]>,
            { status: 400 }
        );
    }

    try {
        const flights = await getFlights(flightNumber);
        return NextResponse.json({ data: flights } as ApiResponse<Flight[]>);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch flight data' } as ApiResponse<Flight[]>,
            { status: 500 }
        );
    }
}
