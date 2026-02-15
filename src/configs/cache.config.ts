import { createClient } from "redis";
import path from "path";
import dotenv from "dotenv";
import logger from "./logger.config.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const redisClient = createClient(/*{url: process.env.REDIS_URL!*/);

redisClient.on("error", (err) => {
  logger.info("Redis Client Creation Error:", err);
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info("Redis Client connected");
  } catch (err) {
    logger.info("Redis Connection Error:", err);
  }
}

export default redisClient;
