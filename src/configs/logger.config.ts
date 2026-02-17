import winston from "winston";
import dotenv from "dotenv";
import path from "path";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// Create a Logtail client
const logtail = new Logtail(process.env.SOURCE_TOKEN!.toString(), {
  endpoint: `https://${process.env.INGESTING_HOST!.toString()}`,
});
const { combine, timestamp, json, errors, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    json(),
    errors({ stack: true }),
    align(),
  ),
  transports: [new winston.transports.Console(), new LogtailTransport(logtail)],
});

export default logger;
