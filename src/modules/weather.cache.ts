import redisClient from "../configs/cache.config";
import { JointWeatherService } from "../types/weather.d.js";

export class Weathercache {
  constructor() {}

  async get(key: string): Promise<JointWeatherService | undefined> {
    const data = await redisClient.get(key);
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
