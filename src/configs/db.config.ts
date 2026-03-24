import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import dotenv from "dotenv";
import logger from "./logger.config.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const dbMap = new Map([
  ["development", process.env.PG_DATABASE_DEV_URL],
  ["test", process.env.PG_DATABASE_TEST_URL],
  ["production", process.env.PG_DATABASE_PROD_URL],
]);
const dburl = dbMap.get(process.env.NODE_ENV!);

const pool = new Pool({
  connectionString: dburl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", () => {
  logger.info("Error Connecting to the database pool");
});

// await pool.query("SELECT 1");
logger.info(`Database (${process.env.NODE_ENV!}) connected successfully`);

const appdb = drizzle({ client: pool });

// await appdb.execute("select 1");
logger.info("Drizzle connected successfully");

export default appdb;
