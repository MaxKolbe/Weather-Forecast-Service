import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import weatherRoute from "./modules/weather/weather.routes.js";
import { connectRedis } from "./configs/cache.config.js";
import { updateCurrentWeatherCron } from "./modules/weather/weather.cron.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("views", "views");
app.set("view-engine", "ejs");

connectRedis();
updateCurrentWeatherCron();

app.use("/api/weather", weatherRoute);

app.use(errorHandler);

export default app;
