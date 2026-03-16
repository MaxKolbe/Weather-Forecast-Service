import * as p from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";

export const city = p.pgTable(
  "city",
  {
    id: p.uuid().primaryKey().notNull(),
    name: p.varchar({ length: 256 }).notNull().unique(),
    country: p.varchar({ length: 256 }).notNull(),
    latitude: p.numeric({ mode: "number" }).notNull(),
    longitude: p.numeric({ mode: "number" }).notNull(),
    searchCount: p.integer("search_count"),
    lastSearched: p.timestamp("last_searched"),
  },
  (table) => [index("city_idx").on(table.name)],
);

export const currentweather = p.pgTable("currentweather", {
  id: p.uuid().primaryKey().notNull(),
  cityId: p
    .uuid("city_id")
    .references(() => city.id)
    .notNull()
    .unique(),
  timestamp: p.timestamp().notNull(),
  temperature: p.numeric({ mode: "number" }).notNull(),
  humidity: p.integer().notNull(),
  windSpeed: p.numeric("wind_speed", { mode: "number" }).notNull(),
  windDirection: p.numeric("wind_direction", { mode: "number" }).notNull(),
  pressure: p.numeric({ mode: "number" }).notNull(),
  weatherMain: p.varchar("conditions", { length: 256 }).notNull(),
  weatherDesc: p.varchar("description", { length: 256 }).notNull(),
  sunrise: p.timestamp().notNull(),
  sunset: p.timestamp().notNull(),
  lastUpdated: p.timestamp("last_updated"),
});

export const forecast = p.pgTable("forecast", {
  id: p.uuid().primaryKey().notNull(),
  cityId: p
    .uuid("city_id")
    .references(() => city.id)
    .notNull(),
  forecastDate: p.timestamp("forecast_date").notNull(),
  temperature: p.numeric({ mode: "number" }).notNull(),
  windSpeed: p.numeric("wind_speed", { mode: "number" }).notNull(),
  windDirection: p.numeric("wind_direction", { mode: "number" }).notNull(),
  pressure: p.numeric({ mode: "number" }).notNull(),
  humidity: p.numeric({ mode: "number" }).notNull(),
  weatherMain: p.varchar("conditions", { length: 256 }).notNull(),
  weatherDesc: p.varchar("description", { length: 256 }).notNull(),
  rainVolume: p.numeric("rain_volume", { mode: "number" }).notNull(),
  probability: p.numeric({ mode: "number" }).notNull(),
});

// const timestamps = {
//   updated_at: p.timestamp(),
//   created_at: p.timestamp().defaultNow().notNull(),
//   deleted_at: p.timestamp(),
// };
