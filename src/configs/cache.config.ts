import { createClient } from "redis";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const redisClient = createClient(/*{url: process.env.REDIS_URL!*/);

redisClient.on("error", (err) => {
  console.log("Redis Client Creation Error:", err);
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis Client connected");
  } catch (err) {
    console.log("Redis Connection Error:", err); 
  }
}

export default redisClient;
