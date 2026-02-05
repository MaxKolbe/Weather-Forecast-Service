import appdb from "../../configs/db.config.js";
import { eq, sql } from "drizzle-orm";
import { Weathercache } from "./weather.cache.js";
import { city, currentweather, forecast } from "./weather.schema.js";
import {
  City,
  Currentweather,
  Forecast,
  Returncurrentweather,
  Returnforecast,
  JointWeatherService,
  WeatherService,
  Updatecurrentweather,
  Updateforecast,
} from "../../types/weather.js";

const Cache = new Weathercache();

export class Weatherservice implements WeatherService<JointWeatherService> {
  constructor(private readonly db = appdb) {}

  async getCurrentWeather(cityName: string): Promise<Returncurrentweather | undefined> {
    const result = await this.db
      .select({
        city: city.name,
        country: city.country,
        timestamp: currentweather.timestamp,
        temperature: currentweather.temperature,
        humidity: currentweather.humidity,
        windSpeed: currentweather.windSpeed,
        windDirection: currentweather.windDirection,
        pressure: currentweather.pressure,
        conditions: currentweather.weatherMain,
        description: currentweather.weatherDesc,
        sunrise: currentweather.sunrise,
        sunset: currentweather.sunset,
      })
      .from(city)
      .innerJoin(currentweather, eq(currentweather.cityId, city.id))
      .where(eq(city.name, cityName));

    // increment city searchcount
    await this.db
      .update(city)
      .set({ searchCount: sql`${city.searchCount} + 1`, lastSearched: sql`NOW()` })
      .where(eq(city.name, cityName)); // on error do nothing...log ?

    // get cache || set cache
    const cachedResult = await Cache.get(`get:currentweather:${cityName}`);
    if (result[0] !== undefined && cachedResult === undefined) {
      await Cache.set(`get:currentweather:${cityName}`, 900, JSON.stringify(result[0])); // 15mins ttl
      await Cache.set(`get:city:${cityName}`, 86400, JSON.stringify(cityName)); // 24hrs ttl
    }

    return result[0];
  }

  async getForecast(cityName: string): Promise<Returnforecast | undefined> {
    const result = await this.db
      .select({
        city: city.name,
        country: city.country,
        date: forecast.forecastDate,
        temperature: forecast.temperature,
        humidity: forecast.humidity,
        windSpeed: forecast.windSpeed,
        conditions: forecast.weatherMain,
        description: forecast.weatherDesc,
      })
      .from(city)
      .innerJoin(forecast, eq(forecast.cityId, city.id))
      .where(sql`${city.name} = ${cityName} AND ${forecast.forecastDate}::DATE = NOW()::DATE`);

    if (result[0] !== undefined) {
      const returnData = {
        city: result[0].city,
        country: result[0].country,
        forecast: {
          date: result[0].date,
          temperature: result[0].temperature,
          humidity: result[0].humidity,
          windSpeed: result[0].windSpeed,
          conditions: result[0].conditions,
          description: result[0].description,
        },
      };

      // increment city searchcount
      await this.db
        .update(city)
        .set({ searchCount: sql`${city.searchCount} + 1`, lastSearched: sql`NOW()` })
        .where(eq(city.name, cityName)); // on error do nothing...log ?

      // get cache || set cache
      const cachedResult = await Cache.get(`get:forecast:${cityName}`);
      if (result[0] !== undefined && cachedResult === undefined) {
        await Cache.set(`get:forecast:${cityName}`, 3600, JSON.stringify(result[0])); // 1hr ttl
        await Cache.set(`get:city:${cityName}`, 86400, JSON.stringify(cityName)); // 24hrs ttl
      }

      return returnData;
    }

    return undefined;
  }

  async createCurrentWeather(args: Currentweather): Promise<Currentweather | undefined> {
    const result = await this.db
      .insert(currentweather)
      .values({
        id: sql`uuid_generate_v4()`,
        cityId: args.cityId,
        timestamp: sql`TO_TIMESTAMP(${args.timestamp})`,
        temperature: args.temperature,
        humidity: args.humidity,
        windSpeed: args.windSpeed,
        windDirection: args.windDirection,
        pressure: args.pressure,
        weatherMain: args.weatherMain,
        weatherDesc: args.weatherDesc,
        sunrise: sql`TO_TIMESTAMP(${args.sunrise})`,
        sunset: sql`TO_TIMESTAMP(${args.sunset})`,
        lastUpdated: sql`NOW()`,
      })
      .returning();

    return result[0];
  }

  async createForecast(args: Forecast): Promise<Forecast | undefined> {
    const result = await this.db
      .insert(forecast)
      .values({
        id: sql`uuid_generate_v4()`,
        cityId: args.cityId,
        forecastDate: sql`TO_TIMESTAMP(${args.forecastDate})`,
        temperature: args.temperature,
        humidity: args.humidity,
        windSpeed: args.windSpeed,
        windDirection: args.windDirection,
        pressure: args.pressure,
        weatherMain: args.weatherMain,
        weatherDesc: args.weatherDesc,
        rainVolume: args.rainVolume,
        probability: args.probability,
      })
      .returning();

    return result[0];
  }

  async createCity(args: City): Promise<City | undefined> {
    const result = await this.db
      .insert(city)
      .values({
        id: sql`uuid_generate_v4()`,
        name: args.name.toLowerCase(),
        country: args.country,
        latitude: args.latitude,
        longitude: args.longitude,
        searchCount: args.searchCount,
        lastSearched: sql`NOW()`,
      })
      .returning();

    return result[0];
  }

  async findCity(cityName: string): Promise<City | undefined> {
    const result = await this.db.select().from(city).where(eq(city.name, cityName));

    return result[0];
  }

  async updateCurrentWeather(
    id: string,
    args: Updatecurrentweather,
  ): Promise<Currentweather | undefined> {
    const result = await this.db
      .update(currentweather)
      .set({
        timestamp: sql`TO_TIMESTAMP(${args.timestamp})`,
        temperature: args.temperature,
        humidity: args.humidity,
        windSpeed: args.windSpeed,
        windDirection: args.windDirection,
        pressure: args.pressure,
        weatherMain: args.weatherMain,
        weatherDesc: args.weatherDesc,
        sunrise: sql`TO_TIMESTAMP(${args.sunrise})`,
        sunset: sql`TO_TIMESTAMP(${args.sunset})`,
        lastUpdated: sql`NOW()`,
      })
      .where(eq(currentweather.id, id))
      .returning();

    return result[0];
  }

  async updateForecast(id: string, args: Updateforecast): Promise<Forecast | undefined> {
    const result = await this.db
      .update(forecast)
      .set({
        forecastDate: sql`TO_TIMESTAMP(${args.forecastDate})`,
        temperature: args.temperature,
        humidity: args.humidity,
        windSpeed: args.windSpeed,
        windDirection: args.windDirection,
        pressure: args.pressure,
        weatherMain: args.weatherMain,
        weatherDesc: args.weatherDesc,
        rainVolume: args.rainVolume,
        probability: args.probability,
      })
      .where(eq(forecast.id, id))
      .returning();

    return result[0];
  }
}
