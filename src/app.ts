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
import * as p from "drizzle-orm/pg-core";
import appdb from "./configs/db.config.js";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { sql, eq, SQL, inArray, asc } from "drizzle-orm";
import { Weathercache } from "./modules/weather/weather.cache.js";
import { city, currentweather } from "./db/schema.js";
import { Request, Response } from "express";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
const API_KEY = process.env.WEATHER_APIKEY;
const cache = new Weathercache();
const users = p.pgTable("users", {
  id: p.bigserial({ mode: "number" }).primaryKey().notNull(),
  city: p.varchar({ length: 150 }).notNull(),
  state: p.varchar({ length: 150 }).notNull(),
});

app.get("/test", async (req: Request, res: Response) => {
  // GET CITYKEYS IN CACHE
  const results = await cache.getkeys("get:city");
  // GET CITYS AND STORE IN cityArr ARRAY
  const cityCacheArr: string[] = [];
  if (results !== undefined) {
    for (var result of results) {
      const splitz = result.split(":");
      cityCacheArr.push(splitz[2]!);
    }
  }
  const cityArr = cityCacheArr.sort();
  console.log("List of Citys to update:", cityArr);
  // GET ALL IDS FOR SAID CITYS
  const cityIds = await appdb
    .select({ id: city.id })
    .from(city)
    .where(inArray(city.name, cityArr))
    .orderBy(asc(city.name));
  console.log("City IDS:", cityIds);
  // FOR EACH CITY RETURN CURRENT WEATHER CONDITIONS AND STORE IN AN ARRAY
  let i = 0;
  const currentWeatherPatches: any = [];
  for (var cityName of cityArr) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return;
      }
      throw new Error(`Fetch failed with status: ${response.status}. Try again.`);
    }

    const data: any = await response.json();
    console.log("No. of city I'm fetching now:", i);
    const input: any = {
      cityId: cityIds[i++]?.id,
      timestamp: data.dt,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      weatherMain: data.weather[0].main,
      weatherDesc: data.weather[0].description,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    };

    currentWeatherPatches.push(input);
  }

  console.log("Items to use as patches", currentWeatherPatches);
  // UPDATE THE DB
  if (currentWeatherPatches.length === 0) {
    return;
  }

  const sqlChunks1: SQL[] = [];
  const sqlChunks2: SQL[] = [];
  const sqlChunks3: SQL[] = [];
  const sqlChunks4: SQL[] = [];
  const sqlChunks5: SQL[] = [];
  const sqlChunks6: SQL[] = [];
  const sqlChunks7: SQL[] = [];
  const sqlChunks8: SQL[] = [];
  const sqlChunks9: SQL[] = [];
  const sqlChunks10: SQL[] = [];
  const ids: string[] = [];

  sqlChunks1.push(sql`(case`);
  sqlChunks2.push(sql`(case`);
  sqlChunks3.push(sql`(case`);
  sqlChunks4.push(sql`(case`);
  sqlChunks5.push(sql`(case`);
  sqlChunks6.push(sql`(case`);
  sqlChunks7.push(sql`(case`);
  sqlChunks8.push(sql`(case`);
  sqlChunks9.push(sql`(case`);
  sqlChunks10.push(sql`(case`);

  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks1.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then TO_TIMESTAMP(${currentWeatherPatch.timestamp})`,
    );
    ids.push(currentWeatherPatch.cityId);
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks2.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.temperature}::NUMERIC`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks3.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.humidity}::INTEGER`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks4.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.windSpeed}::NUMERIC`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks5.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.windDirection}::NUMERIC`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks6.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.pressure}::NUMERIC`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks7.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.weatherMain}`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks8.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then ${currentWeatherPatch.weatherDesc}`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks9.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then TO_TIMESTAMP(${currentWeatherPatch.sunrise})`,
    );
  }
  for (const currentWeatherPatch of currentWeatherPatches) {
    sqlChunks10.push(
      sql`when ${currentweather.cityId} = ${currentWeatherPatch.cityId} then TO_TIMESTAMP(${currentWeatherPatch.sunset})`,
    );
  }

  sqlChunks1.push(sql`end)`);
  sqlChunks2.push(sql`end)`);
  sqlChunks3.push(sql`end)`);
  sqlChunks4.push(sql`end)`);
  sqlChunks5.push(sql`end)`);
  sqlChunks6.push(sql`end)`);
  sqlChunks7.push(sql`end)`);
  sqlChunks8.push(sql`end)`);
  sqlChunks9.push(sql`end)`);
  sqlChunks10.push(sql`end)`);

  const finalSql1: SQL = sql.join(sqlChunks1, sql.raw(" "));
  const finalSql2: SQL = sql.join(sqlChunks2, sql.raw(" "));
  const finalSql3: SQL = sql.join(sqlChunks3, sql.raw(" "));
  const finalSql4: SQL = sql.join(sqlChunks4, sql.raw(" "));
  const finalSql5: SQL = sql.join(sqlChunks5, sql.raw(" "));
  const finalSql6: SQL = sql.join(sqlChunks6, sql.raw(" "));
  const finalSql7: SQL = sql.join(sqlChunks7, sql.raw(" "));
  const finalSql8: SQL = sql.join(sqlChunks8, sql.raw(" "));
  const finalSql9: SQL = sql.join(sqlChunks9, sql.raw(" "));
  const finalSql10: SQL = sql.join(sqlChunks10, sql.raw(" "));
  
  console.log("These are the ids we're using:", ids);

  const updateResult: any = await appdb
    .update(currentweather)
    .set({
      timestamp: finalSql1,
      temperature: finalSql2,
      humidity: finalSql3,
      windSpeed: finalSql4,
      windDirection: finalSql5,
      pressure: finalSql6,
      weatherMain: finalSql7,
      weatherDesc: finalSql8,
      sunrise: finalSql9,
      sunset: finalSql10,
      lastUpdated: sql`NOW()`
    })
    .where(inArray(currentweather.cityId, ids))
    .returning();

  res.status(200).send(updateResult);
});

app.get("/test2", async (req: Request, res: Response) => {
  const inputs = [
    {
      id: 1,
      city: "New York",
      state: "United States",
    },
    {
      id: 2,
      city: "Los Angeles",
      state: "Guam",
    },
    {
      id: 3,
      city: "Chicago",
      state: "Niger",
    },
  ];
  // You have to be sure that inputs array is not empty
  if (inputs.length === 0) {
    return;
  }
  const sqlChunks: SQL[] = [];
  const sqlChunks2: SQL[] = [];
  const ids: number[] = [];
  sqlChunks.push(sql`(case`);
  sqlChunks2.push(sql`(case`);
  for (const input of inputs) {
    sqlChunks.push(sql`when ${users.id} = ${input.id} then ${input.city}`);
    ids.push(input.id);
  }
  for (const input of inputs) {
    sqlChunks2.push(sql`when ${users.id} = ${input.id} then ${input.state}`);
  }
  sqlChunks.push(sql`end)`);
  sqlChunks2.push(sql`end)`);

  const finalSql1: SQL = sql.join(sqlChunks, sql.raw(" "));
  const finalSql2: SQL = sql.join(sqlChunks2, sql.raw(" "));
  const result: any = await appdb
    .update(users)
    .set({ city: finalSql1, state: finalSql2 })
    .where(inArray(users.id, ids))
    .returning();
  /* TRANSLATES TO
    update users set "city" = 
    (case when id = 1 then 'New York' when id = 2 then 'Los Angeles' when id = 3 then 'Chicago' end)
    where id in (1, 2, 3)
*/
  res.send(result);
});

/************************TEST ROUTE************************************/

app.use(errorHandler);

export default app;
