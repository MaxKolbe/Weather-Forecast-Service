import redisClient from "../configs/cache.config";
import appdb from "../configs/db.config.js";
import { sql } from "drizzle-orm";
import { city } from "./weather.schema.js";
import { JointWeatherService } from "../types/weather.d.js";

export class Weathercache {
  constructor() {}

  async get(key: string): Promise<JointWeatherService | undefined> {
    const data = await redisClient.get(key); // could be a string or null

    // increment city searchcount
    if (typeof data === "string") {
      const cityName: string[] = key.split(":");
      await appdb
        .update(city)
        .set({ searchCount: sql`${city.searchCount} + 1` })
        .where(sql`${city.name} = ${cityName.at(-1)}`);
    }

    return data ? JSON.parse(data) : undefined;
  }

  async set(key: string, ttl: number, value: string): Promise<number | undefined> {
    await redisClient.setEx(key, ttl, value);
    return 201;
  }

  async del(key: string): Promise<number | undefined> {
    await redisClient.del(key);
    return 200;
  }
}
