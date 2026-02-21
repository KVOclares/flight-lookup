import { NextRequest, NextResponse } from 'next/server';
import { getFlights } from '@/lib/flights';
import { ApiResponse, Flight } from '@/types';

// --- In-Memory Rate Limiter (For Single-Instance/Dev) ---
// Note: In production, swap this for an external store like @upstash/ratelimit
interface RateLimitInfo {
    count: number;
    resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitInfo>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export async function GET(request: NextRequest) {
    // 1. Rate Limiting Check
    // Get IP (fallback to 'anonymous' if headers missing)
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';

    const now = Date.now();
    const rateData = rateLimitMap.get(ip);

    if (rateData) {
        if (now < rateData.resetTime) {
            // Still in the current window
            if (rateData.count >= MAX_REQUESTS) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' } as ApiResponse<Flight[]>,
                    { status: 429 }
                );
            }
            rateLimitMap.set(ip, { ...rateData, count: rateData.count + 1 });
        } else {
            // Window expired, reset
            rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        }
    } else {
        // First request from this IP
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }

    // 2. Process Request
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
        console.error('[API Route Error]', error);
        return NextResponse.json(
            { error: 'Failed to fetch flight data. Please try again later.' } as ApiResponse<Flight[]>,
            { status: 500 }
        );
    }
}
