import schedule from "node-schedule";
import { Fetchweather } from "./weather.api.js";

const Fetch = new Fetchweather();

export const updateCurrentWeatherCron = () => {
  // runs every two hours
  schedule.scheduleJob("0 */2 * * *", async () => {
    // console.log("Running updateCurrentWeather function...");
    try {
      const taskState = await Fetch.updateCurrentWeatherData();
      if (taskState === undefined) {
        return console.log("Current Weather records update failed");
      }
      return console.log("Current Weather records updated successfully");
    } catch (err) {
      return console.log("There was an error in updating Current Weather records:", err);
    }
  });
};

export const updateForecastCron = () => {
  // runs every two hours
  schedule.scheduleJob("0 */2 * * *", async () => {
    // console.log("Running updateForecastCron function...");
    try {
      const taskState = await Fetch.updateForecastData();
      if (taskState === undefined) {
        return console.log("Forecast records update failed");
      }
      return console.log("Forecast records updated successfully");
    } catch (err) {
      return console.log("There was an error in updating Forecast records:", err);
    }
  });
};

/** 
 Implement bg-job to delete old-unsearched current and forecast weather data
*/
