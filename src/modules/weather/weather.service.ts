import appdb from "../../configs/db.config.js";
import { SQL, sql, eq, asc, inArray } from "drizzle-orm";
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
  CurrentWeatherPatches,
  ForecastPatches,
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
      await Cache.set(`get:city:${cityName}`, 86400, cityName); // 24hrs ttl
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
        await Cache.set(`get:city:${cityName}`, 86400, cityName); // 24hrs ttl
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

  async updateCurrentWeather(
    currentWeatherPatches: CurrentWeatherPatches,
  ): Promise<Currentweather[] | undefined> {
    const sqlChunks1: SQL[] = [];
    const sqlChunks2: SQL[] = [];
    const sqlChunks3: SQL[] = [];
    const sqlChunks4: SQL[] = [];
    const sqlChunks5: SQL[] = [];
    const sqlChunks6: SQL[] = [];
    const sqlChunks7: SQL[] = [];
    const sqlChunks8: SQL[] = [];
    const sqlChunks9: SQL[] = [];
    const sqlChunks10: SQL[] = [];
    const ids: string[] = [];

    sqlChunks1.push(sql`(case`);
    sqlChunks2.push(sql`(case`);
    sqlChunks3.push(sql`(case`);
    sqlChunks4.push(sql`(case`);
    sqlChunks5.push(sql`(case`);
    sqlChunks6.push(sql`(case`);
    sqlChunks7.push(sql`(case`);
    sqlChunks8.push(sql`(case`);
    sqlChunks9.push(sql`(case`);
    sqlChunks10.push(sql`(case`);

    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks1.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then TO_TIMESTAMP(${currentWeatherPatch.timestamp})`,
      );
      ids.push(currentWeatherPatch.cityId);
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks2.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.temperature}::NUMERIC`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks3.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.humidity}::INTEGER`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks4.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.windSpeed}::NUMERIC`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks5.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.windDirection}::NUMERIC`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks6.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.pressure}::NUMERIC`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks7.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.weatherMain}`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks8.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.weatherDesc}`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks9.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then TO_TIMESTAMP(${currentWeatherPatch.sunrise})`,
      );
    }
    for (const currentWeatherPatch of currentWeatherPatches) {
      sqlChunks10.push(
        sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then TO_TIMESTAMP(${currentWeatherPatch.sunset})`,
      );
    }

    sqlChunks1.push(sql`end)`);
    sqlChunks2.push(sql`end)`);
    sqlChunks3.push(sql`end)`);
    sqlChunks4.push(sql`end)`);
    sqlChunks5.push(sql`end)`);
    sqlChunks6.push(sql`end)`);
    sqlChunks7.push(sql`end)`);
    sqlChunks8.push(sql`end)`);
    sqlChunks9.push(sql`end)`);
    sqlChunks10.push(sql`end)`);

    const finalSql1: SQL = sql.join(sqlChunks1, sql.raw(" "));
    const finalSql2: SQL = sql.join(sqlChunks2, sql.raw(" "));
    const finalSql3: SQL = sql.join(sqlChunks3, sql.raw(" "));
    const finalSql4: SQL = sql.join(sqlChunks4, sql.raw(" "));
    const finalSql5: SQL = sql.join(sqlChunks5, sql.raw(" "));
    const finalSql6: SQL = sql.join(sqlChunks6, sql.raw(" "));
    const finalSql7: SQL = sql.join(sqlChunks7, sql.raw(" "));
    const finalSql8: SQL = sql.join(sqlChunks8, sql.raw(" "));
    const finalSql9: SQL = sql.join(sqlChunks9, sql.raw(" "));
    const finalSql10: SQL = sql.join(sqlChunks10, sql.raw(" "));

    console.log("These are the ids we're using:", ids);

    const result: any = await appdb
      .update(currentweather)
      .set({
        timestamp: finalSql1,
        temperature: finalSql2,
        humidity: finalSql3,
        windSpeed: finalSql4,
        windDirection: finalSql5,
        pressure: finalSql6,
        weatherMain: finalSql7,
        weatherDesc: finalSql8,
        sunrise: finalSql9,
        sunset: finalSql10,
        lastUpdated: sql`NOW()`,
      })
      .where(inArray(currentweather.cityId, ids))
      .returning();

    return result;
  }

  async updateForecast(forecastPatches: ForecastPatches): Promise<Forecast[] | undefined> {
    const sqlChunks1: SQL[] = [];
    const sqlChunks2: SQL[] = [];
    const sqlChunks3: SQL[] = [];
    const sqlChunks4: SQL[] = [];
    const sqlChunks5: SQL[] = [];
    const sqlChunks6: SQL[] = [];
    const sqlChunks7: SQL[] = [];
    const sqlChunks8: SQL[] = [];
    const sqlChunks9: SQL[] = [];
    const sqlChunks10: SQL[] = [];
    const ids: string[] = [];

    sqlChunks1.push(sql`(case`);
    sqlChunks2.push(sql`(case`);
    sqlChunks3.push(sql`(case`);
    sqlChunks4.push(sql`(case`);
    sqlChunks5.push(sql`(case`);
    sqlChunks6.push(sql`(case`);
    sqlChunks7.push(sql`(case`);
    sqlChunks8.push(sql`(case`);
    sqlChunks9.push(sql`(case`);
    sqlChunks10.push(sql`(case`);

    for (const forecastPatch of forecastPatches) {
      sqlChunks1.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then TO_TIMESTAMP(${forecastPatch.forecastDate})`,
      );
      ids.push(forecastPatch.cityId);
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks2.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.temperature}::NUMERIC`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks4.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.windSpeed}::NUMERIC`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks5.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.windDirection}::NUMERIC`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks6.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.pressure}::NUMERIC`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks3.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.humidity}::INTEGER`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks7.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.weatherMain}`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks8.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.weatherDesc}`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks9.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.rainVolume}::NUMERIC`,
      );
    }
    for (const forecastPatch of forecastPatches) {
      sqlChunks10.push(
        sql`when ${forecast.cityId} = ${forecastPatch.cityId} then ${forecastPatch.probability}::NUMERIC`,
      );
    }

    sqlChunks1.push(sql`end)`);
    sqlChunks2.push(sql`end)`);
    sqlChunks3.push(sql`end)`);
    sqlChunks4.push(sql`end)`);
    sqlChunks5.push(sql`end)`);
    sqlChunks6.push(sql`end)`);
    sqlChunks7.push(sql`end)`);
    sqlChunks8.push(sql`end)`);
    sqlChunks9.push(sql`end)`);
    sqlChunks10.push(sql`end)`);

    const finalSql1: SQL = sql.join(sqlChunks1, sql.raw(" "));
    const finalSql2: SQL = sql.join(sqlChunks2, sql.raw(" "));
    const finalSql3: SQL = sql.join(sqlChunks3, sql.raw(" "));
    const finalSql4: SQL = sql.join(sqlChunks4, sql.raw(" "));
    const finalSql5: SQL = sql.join(sqlChunks5, sql.raw(" "));
    const finalSql6: SQL = sql.join(sqlChunks6, sql.raw(" "));
    const finalSql7: SQL = sql.join(sqlChunks7, sql.raw(" "));
    const finalSql8: SQL = sql.join(sqlChunks8, sql.raw(" "));
    const finalSql9: SQL = sql.join(sqlChunks9, sql.raw(" "));
    const finalSql10: SQL = sql.join(sqlChunks10, sql.raw(" "));

    console.log("These are the ids we're using:", ids);

    const result: any = await appdb
      .update(forecast)
      .set({
       forecastDate: finalSql1,
       temperature: finalSql2,
       windSpeed: finalSql3,
       windDirection: finalSql4,
       pressure: finalSql5,
       humidity: finalSql6,
       weatherMain: finalSql7,
       weatherDesc: finalSql8,
       rainVolume: finalSql9,
       probability: finalSql10
      })
      .where(inArray(forecast.cityId, ids))
      .returning();

    return result;
  }
/** */
  async deleteCurrentWeather(id: string, cityName: string): Promise<Currentweather | undefined> {
    const result = await this.db
      .delete(currentweather)
      .where(eq(currentweather.cityId, id))
      .returning();

    /*** */
    //check for cache then del from cache
    const [cache1, cache2] = await Promise.all([
      Cache.get(`get:currentweather:${cityName}`),
      Cache.get(`get:city:${cityName}`),
    ]);

    console.log(cache1, cache2);

    if (cache1 !== undefined) {
      Cache.del(`get:currentweather:${cityName}`);
    }
    if (cache2 !== undefined) {
      Cache.del(`get:city:${cityName}`);
    }
    /*** */
    return result[0];
  }
  async deleteForecast(id: string, cityName: string): Promise<Forecast | undefined> {
    const result = await this.db.delete(forecast).where(eq(forecast.cityId, id)).returning();

    /*** */
    //check for cache then del from cache
    const [cache1, cache2] = await Promise.all([
      Cache.get(`get:forecast:${cityName}`),
      Cache.get(`get:city:${cityName}`),
    ]);

    console.log(cache1, cache2);

    if (cache1 !== undefined) {
      Cache.del(`get:forecast:${cityName}`);
    }
    if (cache2 !== undefined) {
      Cache.del(`get:city:${cityName}`);
    }
    /*** */

    return result[0];
  }
/** */
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

  async findCityIds(cityArray: string[]) {
    const result = await appdb
      .select({ id: city.id })
      .from(city)
      .where(inArray(city.name, cityArray))
      .orderBy(asc(city.name));

    return result;
  }
}
