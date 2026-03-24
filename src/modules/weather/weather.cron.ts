import { Queue, Worker, Job } from "bullmq";
import { Fetchweather } from "./weather.api.js";
import logger from "../../configs/logger.config.js";
import dotenv from "dotenv";
dotenv.config({
  path: "../../../.env"
})

const {REDIS_HOST, REDIS_PORT} = process.env
const Fetch = new Fetchweather();
const myQueue = new Queue("updateData");
export async function addJobs() {
  await myQueue.add(
    "updateCurrentWeather",
    {},
    {
      repeat: {
        every: 2 * 60 * 60 * 1000, // add to the queue every 2 hours
      },
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
        count: 1000, // keep up to 1000 jobs
      },
      attempts: 3, // attempt 3 retries on failure
      backoff: {
        type: "exponential",
        delay: 5000, // 5 secs in between retries
      },
    },
  );

  await myQueue.add(
    "updateForecastWeather",
    {},
    {
      repeat: {
        every: 2 * 60 * 60 * 1000, // add to the queue every 2 hours
      },
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
        count: 1000, // keep up to 1000 jobs
      },
      attempts: 3, // attempt 3 retries on failure
      backoff: {
        type: "exponential",
        delay: 5000, // 5 secs in between retries
      },
    },
  );
}

const worker = new Worker(
  "updateData",
  async (job: Job) => {
    switch (job.name) {
      case "updateCurrentWeather":
        const task1State = await Fetch.updateCurrentWeatherData();
        if (task1State === undefined) {
          logger.error("Current Weather records update failed");
          throw new Error("Current Weather records update failed");
        }
        logger.info("Current Weather records updated successfully");
        break;
      case "updateForecastWeather":
        const task2State = await Fetch.updateForecastData();
        if (task2State === undefined) {
          logger.error("Forecast records update failed");
          throw new Error("Forecasr Weather records update failed");
        }
        logger.info("Forecast records updated successfully");
        break;
    }
  },
  {
    connection: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
    },
    concurrency: 10, // 10 jobs can run concurrently
  },
);

worker.on("completed", (job: Job | undefined) => {
  logger.info(`Job ${job!.id} completed at time ${Date.now()}`);
});

// a job is considered failed if the processor function defined in your Worker has thrown an exception.
// or if the job has become stalled and it has consumed the "max stalled count" setting.
worker.on("failed", (job: Job | undefined, err: Error) => {
  logger.error(`Job '${job!.id}' Failed at time ${Date.now()}. Error: ${err.message}`);
});

worker.on("error", (err: Error) => {
  logger.error(err);
});

/** 
 Implement bg-job to delete old-unsearched current and forecast weather data
*/
