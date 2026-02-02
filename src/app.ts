import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import weatherRoute from "./modules/weather.routes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("views", "views");
app.set("view-engine", "ejs");

app.use("/api/weather", weatherRoute);

/******************************************************* */
import { city, currentweather, forecast } from "./modules/weather.schema.js";
import { eq, sql } from "drizzle-orm";
import appdb from "./configs/db.config.js";

app.use("/test", async (req, res, next) => {
  // const result = await db
  //   .select({
  //     field1: users.id,
  //     field2: users.name,
  //   })
  //   .from(users);

  const result = await appdb
    .select({
      city: city.name,
      country: city.country,
      timestamp: currentweather.timestamp,
      temperature: currentweather.temperature,
      humidity: currentweather.humidity,
      windSpeed: currentweather.windSpeed,
      windDirection: currentweather.windDirection,
      pressure: currentweather.pressure,
      conditions: currentweather.weatherMain,
      description: currentweather.weatherDesc,
      sunrise: currentweather.sunrise,
      sunset: currentweather.sunset,
    })
    .from(city)
    .innerJoin(currentweather, eq(currentweather.cityId, city.id))
    .where(eq(city.name, "Berlin"));

  // const { field1, field2 } = result[0];

  console.log("********", result[0]);
});
/******************************************************* */

app.use(errorHandler);

export default app;
