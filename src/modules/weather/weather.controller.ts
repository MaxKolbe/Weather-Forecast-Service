import appdb from "../../configs/db.config.js";
import responseHandler from "../../utils/responseHandler.js";
import { Request, Response, NextFunction } from "express";
import { Weatherservice } from "./weather.service.js";
import { Weathercache } from "./weather.cache.js";
import { Fetchweather } from "./weather.api.js";

const Fetch = new Fetchweather();
const Cache = new Weathercache();
const Weather = new Weatherservice(appdb);

export const getCurrentWeather = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString().toLowerCase();

  if (city === undefined) {
    responseHandler("Please input a city", res, 400);
  }

  try {
    // Check cache
    console.log("CHECKING CACHE");
    const a_current_weather = await Cache.get(`get:currentweather:${city}`);
    if (a_current_weather) {
      console.log(`FOUND SOMETHING IN CACHE`);
      return responseHandler("Success: Current Weather found", res, 200, a_current_weather);
    }

    // Check db
    console.log("CHECKING DATABASE");
    const b_current_weather = await Weather.getCurrentWeather(city!);
    if (b_current_weather) {
      console.log(`FOUND SOMETHING IN DATABASE`);
      return responseHandler("Success: Current Weather found", res, 200, b_current_weather);
    }

    // fetch from api
    console.log("CHECKING API");
    const c_current_weather = await Fetch.fetchCurrentWeather(city!);
    if (c_current_weather) {
      console.log(`FOUND SOMETHING IN API`);
      return responseHandler("Success: Current Weather found", res, 200, c_current_weather);
    }

    return responseHandler(`Could not find the Current Weather of city: ${city}`, res, 404);
  } catch (err) {
    next(err);
  }
};

export const getWeatherForecast = (req: Request, res: Response, next: NextFunction) => {};
