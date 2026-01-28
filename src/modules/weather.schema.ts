import * as p from "drizzle-orm/pg-core";

export const city = p.pgTable("city", {
  id: p.uuid().primaryKey().notNull(),
  name: p.varchar({ length: 256 }).notNull(),
  country: p.varchar({ length: 256 }).notNull(),
  latitude: p.varchar({ length: 256 }).notNull(),
  longitude: p.varchar({ length: 256 }).notNull(),
  searchCount: p.integer("search_count"),
  lastSearched: p.timestamp("last_searched"),
});

export const currentweather = p.pgTable("currentweather", {
  id: p.uuid().primaryKey().notNull(),
  cityId: p.uuid("city_id").references(() => city.id),
  timestamp: p.timestamp(),
  temperature: p.integer(),
  humidity: p.integer(),
  windSpeed: p.integer(),
  windDirection: p.integer(),
  pressure: p.integer(),
  weatherMain: p.varchar("conditions", { length: 256 }),
  weatherDesc: p.varchar("description", { length: 256 }),
  sunrise: p.timestamp(),
  sunset: p.timestamp(),
  lastUpdated: p.timestamp("last_updated"),
});

export const forecast = p.pgTable("forecast", {
  id: p.uuid().primaryKey().notNull(),
  cityId: p.uuid(),
  forecastDate: p.timestamp(),
  temperature: p.integer(),
  windSpeed: p.integer(),
  windDirection: p.integer(),
  pressure: p.integer(),
  humidity: p.integer(),
  weatherMain: p.varchar("conditions", { length: 256 }),
  weatherDesc: p.varchar("description", { length: 256 }),
  rainVolume: p.integer(),
  probability: p.integer(),
});

// const timestamps = {
//   updated_at: p.timestamp(),
//   created_at: p.timestamp().defaultNow().notNull(),
//   deleted_at: p.timestamp(),
// };
