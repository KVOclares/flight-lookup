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
  };
  
  arrival: {
    city: string;
    airportCode: string;
    timeLocal: string; // ISO 8601 string representing local time
    timezone: string; // IANA timezone string e.g., 'Asia/Tokyo'
  };
  
  status: FlightStatus;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
