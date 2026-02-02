import responseHandler from "../utils/responseHandler.js";
import appdb from "../configs/db.config.js";
import { Request, Response, NextFunction } from "express";
import { Weatherservice } from "./weather.service.js";
import { Fetchweather } from "./weather.api.js";

const Weather = new Weatherservice(appdb);
const Fetch = new Fetchweather();

export const getCurrentWeather = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString();

  try {
    // Check db
    console.log("I HIT THE DATABASE FIRST");
    const a_current_weather = await Weather.getCurrentWeather(city!);
    if (a_current_weather) {
      console.log("FOUND SOMETHING");
      return responseHandler("Success: Current Weather found", res, 200, a_current_weather);
    }

    // fetch from api
    console.log("NOTHING IN DB SO I HIT THE FETCH API INSTEAD");
    const b_current_weather = await Fetch.fetchCurrentWeather(city!);
    if (b_current_weather) {
      return responseHandler("Success: Current Weather found", res, 200, b_current_weather);
    }

    return responseHandler("Error: Could not find Current Weather", res, 404);
  } catch (err) {
    next(err);
  }
};

export const getWeatherForecast = (req: Request, res: Response, next: NextFunction) => {};
