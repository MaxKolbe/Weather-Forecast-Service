import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import appdb from "../configs/db.config.js";
import { Weathercache } from "./weather.cache.js";
import { Weatherservice } from "./weather.service.js";
import { City, Returncurrentweather } from "../types/weather.d.js";

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
    const city: City | undefined = await Weather.findCity(cityName);
    const newCityArr: string[] = [];

    if (!city) {
      const newCity = await Weather.createCity({
        name: data.name,
        country: data.sys.country,
        latitude: data.coord.lat,
        longitude: data.coord.lon,
        searchCount: 1,
      });

      newCityArr.push(newCity!.id!, newCity!.name, newCity!.country);
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

    // fnc to increase city searchcount

    const returnData: Returncurrentweather = {
      city: city?.name ? city.name : newCityArr[1]!,
      country: city?.country ? city.country : newCityArr[2]!,
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
      `get:currentweather:${city?.name ? city.name : newCityArr[1]!}`,
      900,
      JSON.stringify(returnData),
    );

    return returnData;
  }

  //   async fetchForecast(cityName: string) {
  //     const response = await fetch(`api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);

  //   }
}
