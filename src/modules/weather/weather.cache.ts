import isStringArray from "../../utils/isStringArray.js";
import redisClient from "../../configs/cache.config.js";
import appdb from "../../configs/db.config.js";
import { sql } from "drizzle-orm";
import { city } from "./weather.schema.js";
import { JointWeatherService } from "../../types/weather.js";

export class Weathercache {
  constructor() {}

  async get(key: string): Promise<JointWeatherService | undefined> {
    const data = await redisClient.get(key); // could be a string or null

    // increment city searchcount
    if (typeof data === "string") {
      const cityName: string[] = key.split(":");
      await appdb
        .update(city)
        .set({ searchCount: sql`${city.searchCount} + 1`, lastSearched: sql`NOW()` })
        .where(sql`${city.name} = ${cityName.at(-1)}`);
    }

    return data ? JSON.parse(data) : undefined;
  }

  async getall(key: string): Promise<string[] | undefined> {
    //blocking operation
    const keysArray = await redisClient.keys(`${key}:*`);
    console.log("keysArray:", keysArray);

    if (keysArray.length === 0) {
      return undefined;
    }

    const values = await redisClient.mGet(keysArray);
    return isStringArray(values) ? values : undefined;
  }

  async set(key: string, ttl: number, value: string): Promise<number | undefined> {
    await redisClient.setEx(key, ttl, value);
    return 201;
  }

  async del(key: string): Promise<number | undefined> {
    await redisClient.del(key);
    return 200;
  }

  async getkeys(key: string): Promise<string[] | undefined> {
    // blocking operation
    const keys = await redisClient.keys(`${key}:*`);
    console.log("keys:", keys);
    return keys ? keys : undefined;
  }

  //using scan
  async getAllValues(keypattern: string, limit: number): Promise<string[] | undefined> {
    //non blocking
    let cursor = "0";
    const keySet = new Set<string>();
    const valueArray: string[] = [];

    do {
      const { cursor: nextCursor, keys } = await redisClient.scan(cursor, {
        MATCH: keypattern,
        COUNT: 10,
      });

      for (const key of keys) {
        const value = await redisClient.get(key);
        if (typeof value === "string") {
          if (keySet.has(value)) continue;
          keySet.add(value);
          valueArray.push(value);
        }
      
        if (valueArray.length === limit) {
          return valueArray;
        }
      }

      cursor = nextCursor;
    } while (cursor !== "0");
    return valueArray;
  }

  /**
  // IMPLEMENT DELETE CACHE KEY PATTERNS FUNCTION AT A LATER DATE 
  async delPattern(pattern: string): Promise<string[] | undefined> {
    try {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      return keys;
    } catch (err) {
      if (err instanceof Error) {
        console.error("[Cache Error - delPattern]:", err.message);
      }
    }
  }
*/
}
