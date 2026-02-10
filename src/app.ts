import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import weatherRoute from "./modules/weather/weather.routes.js";
import { connectRedis } from "./configs/cache.config.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("views", "views");
app.set("view-engine", "ejs");

connectRedis();

app.use("/api/weather", weatherRoute);

/************************TEST ROUTE************************************/
import { Request, Response } from "express";
import { Fetchweather } from "./modules/weather/weather.api.js";

const Fetch = new Fetchweather()

app.get("/test2", async (req: Request, res: Response) => {
  // console.log("ROUTE /TEST2 RESULT:", await Fetch.updateCurrentWeatherData())
   console.log("ROUTE /TEST2 RESULT:", await Fetch.updateForecastData())
}); 

/************************TEST ROUTE************************************/

app.use(errorHandler);

export default app;
