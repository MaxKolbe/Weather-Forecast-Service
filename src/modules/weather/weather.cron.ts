import schedule from "node-schedule";
import logger from "../../configs/logger.config.js";
import { Fetchweather } from "./weather.api.js";

const Fetch = new Fetchweather();

export const updateCurrentWeatherCron = () => {
  // runs every two hours
  schedule.scheduleJob("0 */2 * * *", async () => {
    logger.info("Running updateCurrentWeather function...");
    try {
      const taskState = await Fetch.updateCurrentWeatherData();
      if (taskState === undefined) {
        return logger.info("Current Weather records update failed");
      }
      return logger.info("Current Weather records updated successfully");
    } catch (err) {
      return logger.error(`There was an error in updating Current Weather records: ${err}`);
    }
  });
};

export const updateForecastCron = () => {
  // runs every three hours
  schedule.scheduleJob("0 */3 * * *", async () => {
    logger.info("Running updateForecastCron function...");
    try {
      const taskState = await Fetch.updateForecastData();
      if (taskState === undefined) {
        return logger.info("Forecast records update failed");
      }
      return logger.info("Forecast records updated successfully");
    } catch (err) {
      return logger.error(`There was an error in updating Forecast records: ${err}`);
    }
  });
};

/** 
 Implement bg-job to delete old-unsearched current and forecast weather data
*/
