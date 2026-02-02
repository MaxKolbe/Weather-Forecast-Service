import redisClient from "../configs/cache.config";
// import { Returncurrentweather } from "../types/weather.d.js";

export class Weathercache {
  constructor() {}

  async get(key: string) /**: Promise<Returncurrentweather | null | undefined> */ {
    const data = await redisClient.get(key);
    console.log("SOME SORT OF DATA WAS RETRIEVED FROM CACHE");
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, ttl: number, value: string) /**: Promise<string | null | undefined> */ {
    const data = await redisClient.setEx(key, ttl, value);

    console.log("DATA SET IN CACHE");
    return {
      status: 200,
      message: "Created new Key",
      data,
    };
  }

  //   static async del(key: string): Promise<number | undefined> {
  //     try {
  //       const response = await redisClient.del(key);

  //       return response;
  //     } catch (err) {
  //       if (err instanceof Error) {
  //         console.error("[Cache Error - del]:", err.message);
  //       }
  //     }
  //   }
}
