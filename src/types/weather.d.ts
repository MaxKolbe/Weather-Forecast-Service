export interface City {
  id: number;
  name: string;
  country: string;
  latitude: string;
  longitude: string;
  searchCount: number | null;
  lastSearched: Date | null;
}

export interface Currentweather {
  id: string;
  cityId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  weatherMain: string;
  weatherDesc: string;
  sunrise: Date;
  sunset: Date;
  lastUpdated: Date;
}

export interface Forecast {
  id: string;
  cityId: string;
  forecastDate: Date;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  humidity: number;
  weatherMain: string;
  weatherDesc: string;
  rainVolume: number;
  probability: number;
}
