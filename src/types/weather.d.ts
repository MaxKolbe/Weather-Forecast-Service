export interface City {
  id?: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  searchCount: number | null;
  lastSearched?: Date | null;
}

export interface Currentweather {
  id?: string;
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
  lastUpdated?: Date | null;
}

export interface Forecast {
  id?: string;
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
export interface Returncurrentweather {
  city: string;
  country: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  conditions: string;
  description: string;
  sunrise: Date;
  sunset: Date;
}

interface Rforecast {
  date: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  description: string;
}
export interface Returnforecast {
  city: string;
  country: string;
  forecast: Rforecast;
}

export type JointWeatherService =
  | City
  | Returncurrentweather
  | Returnforecast
  | Currentweather
  | Forecast;

export interface Updatecurrentweather {
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
}

export interface Updateforecast {
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

export interface WeatherService<T> {
  getCurrentWeather(cityName: string): Promise<T | undefined>;
  getForecast(cityName: string): Promise<T | undefined>;
  createCity(args: City): Promise<T | undefined>;
  createCurrentWeather(args: Currentweather): Promise<T | undefined>;
  createForecast(args: Forecast): Promise<T | undefined>;
  updateCurrentWeather(id: string, args: Updatecurrentweather): Promise<T | undefined>;
  updateForecast(id: string, args: Forecast): Promise<T | undefined>;
}
