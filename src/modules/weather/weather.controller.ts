import appdb from "../../configs/db.config.js";
import logger from "../../configs/logger.config.js";
import responseHandler from "../../utils/responseHandler.js";
import { Request, Response, NextFunction } from "express";
import { Weatherservice } from "./weather.service.js";
import { Weathercache } from "./weather.cache.js";
import { Fetchweather } from "./weather.api.js";

const Fetch = new Fetchweather();
const Cache = new Weathercache();
export const Weather = new Weatherservice(appdb);

export const getCurrentWeather = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString().toLowerCase();

  if (city === undefined) {
    return responseHandler("Please input a city", res, 400);
  }

  try {
    // Check cache
    logger.debug(`CHECKING CACHE`);
    const a_current_weather = await Cache.get(`get:currentweather:${city}`);
    if (a_current_weather) {
      logger.debug(`FOUND SOMETHING IN CACHE`);
      return responseHandler("Success: Current Weather found", res, 200, a_current_weather);
    }

    // Check db
    logger.debug(`CHECKING DATABASE `);
    const b_current_weather = await Weather.getCurrentWeather(city!);
    if (b_current_weather) {
      logger.debug(`FOUND SOMETHING IN DATABASE`);
      return responseHandler("Success: Current Weather found", res, 200, b_current_weather);
    }

    // fetch from api
    logger.debug(`CHECKING API`);
    const c_current_weather = await Fetch.fetchCurrentWeather(city!);
    if (c_current_weather) {
      logger.debug(`FOUND SOMETHING IN API`);
      return responseHandler("Success: Current Weather found", res, 200, c_current_weather);
    }

    return responseHandler(`Could not find the Current Weather of city: ${city}`, res, 404);
  } catch (err: any) {
    if (err.message.includes("ENOTFOUND api.openweathermap.org")) {
      logger.error(`${err}`)
      return responseHandler(`Network error. Check your nextwork and try again`, res, 503);
    } else if (err.message.includes("connect ETIMEDOUT")) {
      logger.error(`${err}`)
      return responseHandler(`Weather service timed out. Reload or Try again`, res, 504);
    }
    return next(err); 
  }
};

export const getWeatherForecast = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString().toLowerCase();

  if (city === undefined) {
    return responseHandler("Please input a city", res, 400);
  }

  try {
    // Check cache
    logger.debug(`CHECKING CACHE`);
    const a_forecast = await Cache.get(`get:forecast:${city}`);
    if (a_forecast) {
      logger.debug(`FOUND SOMETHING IN CACHE`);
      return responseHandler("Success: Weather Forecast found", res, 200, a_forecast);
    }

    // Check db
    logger.debug(`CHECKING DATABASE`);
    const b_forecast = await Weather.getForecast(city!);
    if (b_forecast) {
      logger.debug(`FOUND SOMETHING IN DATABASE`);
      return responseHandler("Success: Weather Forecast found", res, 200, b_forecast);
    }

    // fetch from api
    logger.debug(`CHECKING API`);
    const c_forecast = await Fetch.fetchForecast(city!);
    if (c_forecast) {
      logger.debug(`FOUND SOMETHING IN API`);
      return responseHandler(`Success: Weather Forecast found`, res, 200, c_forecast);
    }

    return responseHandler(`Could not find the Weather Forecast for city: ${city}`, res, 404);
  } catch (err: any) {
    if (err.message.includes("ENOTFOUND api.openweathermap.org")) {
      logger.error(`${err}`)
      return responseHandler(`Network error. Check your nextwork and try again`, res, 503);
    } else if (err.message.includes("connect ETIMEDOUT")) {
      logger.error(`${err}`)
      return responseHandler(`Weather service timed out. Reload or Try again`, res, 504);
    }
    return next(err);
  }
};

/* DASHBOARD CONTROLLER */
export const getVisitorDashboard = async (req: Request, res: Response, next: NextFunction) => {
  const limit = req.query.limit ? Number(req.query.limit) : 1; // Will implement better pagination
  const breakoutNumnber = limit * 4;

  try {
    // Check cache
    logger.debug(`CHECKING CACHE`);
    const current_weather = await Cache.getall(`get:currentweather`);
    if (current_weather) {
      let i = 0;
      const currentweatherArray = [];
      for (let w of current_weather) {
        if (i === breakoutNumnber) {
          break;
        }
        i++;
        currentweatherArray.push(JSON.parse(w));
      }

      return res.render("home", { req, weatherData: currentweatherArray, limit });
    }

    return res.render("home", { req, weatherData: false, limit });
  } catch (err: any) {
    return res
      .status(500)
      .redirect(`/api/v1/weather/home?error=There was an error on our side: ${err.message}`);
  }
};

export const weatherDetails = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city ? req.query.city.toString().toLowerCase().trim() : undefined;

  if (city === undefined) {
    return res.status(400).redirect(`/api/v1/weather/home?message=Please+input+a+city`);
  }

  try {
    const [currentweather, forecast] = await Promise.all([
      Weather.getCurrentWeatherBundle(city),
      Weather.getForecastBundle(city),
    ]);

    if (currentweather && forecast) {
      return res.render("weather", { req, currentweather, forecast });
    }
    res
      .status(400)
      .redirect(`/api/v1/weather/home?message=Could not find weather information for ${city}`);
  } catch (err: any) {
    if (err.message.includes("ENOTFOUND api.openweathermap.org")) {
      logger.error(`${err}`)
      return res
        .status(500)
        .redirect(`/api/v1/weather/home?error=Error: Check your nextwork and try again`);
    } else if (err.message.includes("connect ETIMEDOUT")) {
      logger.error(`${err}`)
      return res
        .status(500)
        .redirect(`/api/v1/weather/home?error=Error: Reload or Try again`);
    }
    return res
      .status(500)
      .redirect(`/api/v1/weather/home?error=There was an error on our side: ${err.message}`);
  }
};

/** */
export const getClientCurrentWeather = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString().toLowerCase();

  if (city === undefined) {
    return res.status(400).redirect(`/home?message=Please+input+a+city`);
  }

  try {
    // Check cache
    logger.debug("CHECKING CACHE");
    const a_current_weather = await Cache.get(`get:currentweather:${city}`);
    if (a_current_weather) {
      logger.debug(`FOUND SOMETHING IN CACHE`);
      return res.render("weather.html", { req, currentweather: a_current_weather });
    }

    // Check db
    logger.debug("CHECKING DATABASE");
    const b_current_weather = await Weather.getCurrentWeather(city!);
    if (b_current_weather) {
      logger.debug(`FOUND SOMETHING IN DATABASE`);
      return res.render("weather.html", { req, currentweather: b_current_weather });
    }

    // fetch from api
    logger.debug("CHECKING API");
    const c_current_weather = await Fetch.fetchCurrentWeather(city!);
    if (c_current_weather) {
      logger.debug(`FOUND SOMETHING IN API`);
      return res.render("weather.html", { req, currentweather: c_current_weather });
    }

    return res
      .status(404)
      .redirect(`/home?message=Could+not+find+the+Current+Weather+of+city:+${city}`);
  } catch (err: any) {
    if (err.message.includes("ENOTFOUND api.openweathermap.org")) {
      logger.error(`${err}`)
      return res
        .status(500)
        .redirect(`/api/v1/weather/home?error=Error: Check your nextwork and try again`);
    } else if (err.message.includes("connect ETIMEDOUT")) {
      logger.error(`${err}`)
      return res
        .status(500)
        .redirect(`/api/v1/weather/home?error=Error: Reload or Try again`);
    }
    return res
      .status(500)
      .redirect(`/api/v1/weather/home?error=There was an error on our side: ${err.message}`);
  }
};

export const getClientWeatherForecast = async (req: Request, res: Response, next: NextFunction) => {
  const city = req.query.city?.toString().toLowerCase();

  if (city === undefined) {
    return res.status(400).redirect(`/home?message=Please+input+a+city`);
  }

  try {
    // Check cache
    logger.debug("CHECKING CACHE");
    const a_forecast = await Cache.get(`get:forecast:${city}`);
    if (a_forecast) {
      logger.debug(`FOUND SOMETHING IN CACHE`);
      return res.render("weather.html", { req, forecast: a_forecast });
    }

    // Check db
    logger.debug("CHECKING DATABASE");
    const b_forecast = await Weather.getForecast(city!);
    if (b_forecast) {
      logger.debug(`FOUND SOMETHING IN DATABASE`);
      return res.render("weather.html", { req, forecast: b_forecast });
    }

    // fetch from api
    logger.debug("CHECKING API");
    const c_forecast = await Fetch.fetchForecast(city!);
    if (c_forecast) {
      logger.debug(`FOUND SOMETHING IN API`);
      return res.render("weather.html", { req, forecast: c_forecast });
    }

    return res
      .status(404)
      .redirect(`/home?message=Could+not+find+the+Weather+Forecast+for+city:+${city}`);
  } catch (err: any) {
    if (err.message.includes("ENOTFOUND api.openweathermap.org")) {
      logger.error(`${err}`)
      return res
        .status(500)
        .redirect(`/api/v1/weather/home?error=Error: Check your nextwork and try again`);
    } else if (err.message.includes("connect ETIMEDOUT")) {
      logger.error(`${err}`)
      return res
        .status(500)
        .redirect(`/api/v1/weather/home?error=Error: Reload or Try again`);
    }
    return res
      .status(500)
      .redirect(`/api/v1/weather/home?error=There was an error on our side: ${err.message}`);
  }
};
/** */
