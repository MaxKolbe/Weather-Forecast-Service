import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import appdb from "../../configs/db.config.js";
import { Weathercache } from "./weather.cache.js";
import { Weatherservice } from "./weather.service.js";
import { Returncurrentweather, Returnforecast } from "../../types/weather.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const Cache = new Weathercache();
const Weather = new Weatherservice(appdb);
const API_KEY = process.env.WEATHER_APIKEY;

export class Fetchweather {
  constructor() {}

  async fetchCurrentWeather(cityName: string): Promise<Returncurrentweather | undefined> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return;
      }
      throw new Error(`Fetch failed with status: ${response.status}. Try again.`);
    }

    const data: any = await response.json();

    /* check for city created due to forecast query*/
    const city = await Weather.findCity(cityName);
    const newCityArr: string[] = [];
    if (!city) {
      const newCity = await Weather.createCity({
        name: data.name,
        country: data.sys.country,
        latitude: data.coord.lat,
        longitude: data.coord.lon,
        searchCount: 1,
      });

      newCityArr.push(newCity?.id!);
    }

    // store in db
    await Weather.createCurrentWeather({
      cityId: city?.id ? city.id : newCityArr[0]!,
      timestamp: data.dt,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      weatherMain: data.weather[0].main,
      weatherDesc: data.weather[0].description,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    });

    const returnData: Returncurrentweather = {
      city: data.name.toLowerCase(),
      country: data.sys.country,
      timestamp: new Date(data.dt * 1000),
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
    };

    // store in cache
    await Cache.set(
      `get:currentweather:${data.name.toLowerCase()}`,
      900,
      JSON.stringify(returnData),
    ); // 15mins ttl
    await Cache.set(`get:city:${data.name.toLowerCase()}`, 86400, data.name.toLowerCase()); // 24hrs ttl

    return returnData;
  }

  async fetchForecast(cityName: string): Promise<Returnforecast | undefined> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return;
      }
      throw new Error(`Fetch failed with status: ${response.status}. Try again.`);
    }

    const data: any = await response.json();

    /* check for city created due to currentweather query*/
    const city = await Weather.findCity(cityName);
    const newCityArr: string[] = [];

    if (!city) {
      const newCity = await Weather.createCity({
        name: data.city.name,
        country: data.city.country,
        latitude: data.city.coord.lat,
        longitude: data.city.coord.lon,
        searchCount: 1,
      });

      newCityArr.push(newCity?.id!);
    }

    // store in db
    await Weather.createForecast({
      cityId: city?.id ? city.id : newCityArr[0]!,
      forecastDate: data.list[0].dt,
      temperature: data.list[0].main.temp,
      windSpeed: data.list[0].wind.speed,
      windDirection: data.list[0].wind.deg,
      pressure: data.list[0].main.pressure,
      humidity: data.list[0].main.humidity,
      weatherMain: data.list[0].weather[0].main,
      weatherDesc: data.list[0].weather[0].description,
      rainVolume: data.list[0].rain ? data["list"][0]["rain"]["3h"] : 0, // clap for me joor lol
      probability: data.list[0].pop,
    });

    const returnData: Returnforecast = {
      city: data.city.name.toLowerCase(),
      country: data.city.country,
      forecast: {
        date: new Date(data.list[0].dt * 1000),
        temperature: data.list[0].main.temp,
        humidity: data.list[0].main.humidity,
        windSpeed: data.list[0].wind.speed,
        conditions: data.list[0].weather[0].main,
        description: data.list[0].weather[0].description,
      },
    };

    // store in cache
    await Cache.set(
      `get:forecast:${data.city.name.toLowerCase()}`,
      3600,
      JSON.stringify(returnData),
    ); // 1hr ttl
    await Cache.set(`get:city:${data.name.toLowerCase()}`, 86400, data.city.name.toLowerCase()); // 24hrs ttl

    return returnData;
  }

  async updateCurrentWeatherData(cityName: string): Promise<Boolean | undefined> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return;
      }
      throw new Error(`Fetch failed with status: ${response.status}. Try again.`);
    }

    const data: any = await response.json();
    const oldCity = await Weather.findCity(cityName)

    await Weather.updateCurrentWeather(oldCity?.id!, {
      timestamp: data.dt,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      weatherMain: data.weather[0].main,
      weatherDesc: data.weather[0].description,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    });

    // if cached delete
    const cachedResult = await Cache.get(`get:currentweather:${cityName}`);
    if (cachedResult !== undefined) {
      await Cache.del(`get:currentweather:${cityName}`);
    }

    return true;
  }

  async updateForecastData(cityName: string): Promise<Boolean | undefined> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return;
      }
      throw new Error(`Fetch failed with status: ${response.status}. Try again.`);
    }

    const data: any = await response.json();
    const oldCity = await Weather.findCity(cityName)

    await Weather.updateForecast(oldCity?.id!, {
      forecastDate: data.list[0].dt,
      temperature: data.list[0].main.temp,
      windSpeed: data.list[0].wind.speed,
      windDirection: data.list[0].wind.deg,
      pressure: data.list[0].main.pressure,
      humidity: data.list[0].main.humidity,
      weatherMain: data.list[0].weather[0].main,
      weatherDesc: data.list[0].weather[0].description,
      rainVolume: data.list[0].rain ? data["list"][0]["rain"]["3h"] : 0, // clap for me joor lol
      probability: data.list[0].pop,
    });

    // if cached delete
    const cachedResult = await Cache.get(`get:forecast:${cityName}`);
    if (cachedResult !== undefined) {
      await Cache.del(`get:forecast:${cityName}`);
    }

    return true;
  }
}
