import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
  ssl: false,
});

pool.on("error", () => {
  console.log("Error Connecting to the database pool");
});

await pool.query("SELECT 1");
console.log("Database connected successfully");

const appdb = drizzle({ client: pool });

await appdb.execute("select 1");
console.log("Drizzle connected successfully");

export default appdb;
