export type FlightStatus = 'On Time' | 'Delayed' | 'Landed' | 'Cancelled';

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;

  departure: {
    city: string;
    airportCode: string;
    timeLocal: string; // ISO 8601 string representing local time
    timezone: string; // IANA timezone string e.g., 'America/Los_Angeles'
    terminal?: string | null;
    gate?: string | null;
    delay?: number | null; // minutes late
    actual?: string | null; // actual departure ISO string
  };

  arrival: {
    city: string;
    airportCode: string;
    timeLocal: string; // ISO 8601 string representing local time
    timezone: string; // IANA timezone string e.g., 'Asia/Tokyo'
    terminal?: string | null;
    gate?: string | null;
    baggage?: string | null; // baggage claim belt
    delay?: number | null;
    actual?: string | null;
  };

  status: FlightStatus;
  aircraft?: string | null; // IATA aircraft type code e.g. 'B77W'
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// --- AviationStack API Interfaces ---

export interface AviationStackPagination {
  limit: number;
  offset: number;
  count: number;
  total: number;
}

export interface AviationStackDeparture {
  airport: string;
  timezone: string;
  iata: string;
  icao: string;
  terminal: string | null;
  gate: string | null;
  delay: number | null;
  scheduled: string;
  estimated: string;
  actual: string | null;
  estimated_runway: string | null;
  actual_runway: string | null;
}

export interface AviationStackArrival {
  airport: string;
  timezone: string;
  iata: string;
  icao: string;
  terminal: string | null;
  gate: string | null;
  baggage: string | null;
  delay: number | null;
  scheduled: string;
  estimated: string;
  actual: string | null;
  estimated_runway: string | null;
  actual_runway: string | null;
}

export interface AviationStackAirline {
  name: string;
  iata: string;
  icao: string;
}

export interface AviationStackFlightInfo {
  number: string;
  iata: string;
  icao: string;
  codeshared: any | null; // Using any for nested optional object if present
}

export interface AviationStackAircraft {
  registration: string | null;
  iata: string | null;
  icao: string | null;
  icao24: string | null;
}

export interface AviationStackLive {
  updated: string;
  latitude: number;
  longitude: number;
  altitude: number;
  direction: number;
  speed_horizontal: number;
  speed_vertical: number;
  is_ground: boolean;
}

export interface AviationStackFlight {
  flight_date: string;
  flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted';
  departure: AviationStackDeparture;
  arrival: AviationStackArrival;
  airline: AviationStackAirline;
  flight: AviationStackFlightInfo;
  aircraft: AviationStackAircraft | null;
  live: AviationStackLive | null;
}

export interface AviationStackResponse {
  pagination: AviationStackPagination;
  data: AviationStackFlight[];
  // If error occurs
  error?: {
    code: string;
    message: string;
  };
}
