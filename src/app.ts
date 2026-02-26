import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler";
import weatherRoute from "./modules/weather/weather.routes";
import { connectRedis } from "./configs/cache.config";
import { updateCurrentWeatherCron, updateForecastCron } from "./modules/weather/weather.cron";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("views", "views"); 
app.set("view engine", "ejs");

connectRedis();
updateCurrentWeatherCron();
updateForecastCron();

app.use("/api/v1/weather", weatherRoute);

app.use(errorHandler);

export default app;
