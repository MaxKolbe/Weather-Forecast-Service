import responseHandler from "../utils/responseHandler.js";
import appdb from "../configs/db.config.js";
import { Request, Response, NextFunction } from "express";
import { Weatherservice } from "./weather.service.js";
import { Fetchweather } from "./weather.api.js";
import { Weathercache } from "./weather.cache.js";

const Fetch = new Fetchweather();
const Cache = new Weathercache();
const Weather = new Weatherservice(appdb);

export const getCurrentWeather = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString();

  try {
    // Check cache
    console.log("I HIT THE CACHE FIRST");
    const a_current_weather = await Cache.get(`get:currentweather:${city}`);
    if (a_current_weather) {
      console.log("FOUND SOMETHING IN CACHE");
      return responseHandler("Success: Current Weather found", res, 200, a_current_weather);
    }

    // Check db
    console.log("NOTHING IN CACHE SO I HIT THE DATABASE NEXT"); 
    const b_current_weather = await Weather.getCurrentWeather(city!);
    if (b_current_weather) {
      console.log("FOUND SOMETHING IN DATABASE");
      return responseHandler("Success: Current Weather found", res, 200, b_current_weather);
    }

    // fetch from api
    console.log("NOTHING IN DB SO I HIT THE FETCH API INSTEAD");
    const c_current_weather = await Fetch.fetchCurrentWeather(city!);
    if (c_current_weather) {
      console.log("FOUND SOMETHING IN API");
      return responseHandler("Success: Current Weather found", res, 200, c_current_weather);
    }

    return responseHandler("Error: Could not find Current Weather", res, 404);
  } catch (err) {
    next(err);
  }
};

export const getWeatherForecast = (req: Request, res: Response, next: NextFunction) => {};
