import schedule from "node-schedule";
import { Fetchweather } from "./weather.api.js";

const Fetch = new Fetchweather();

export const updateCurrentWeatherCron = () => {
  // runs every two hours
  schedule.scheduleJob("0 */2 * * *", async () => {
    // console.log("Running updateCurrentWeather function...");
    const taskState = await Fetch.updateCurrentWeatherData();
    if (taskState === undefined) {
      console.log("Current Weather records update failed");
    }
    console.log("Current Weather records updated successfully");
  });
};
