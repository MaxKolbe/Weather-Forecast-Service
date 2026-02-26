import express from "express";
import {
  getCurrentWeather,
  getWeatherForecast,
  getVisitorDashboard,
  weatherDetails,
} from "./weather.controller";

const router = express.Router();

// API routes
router.get("/current", getCurrentWeather);
router.get("/forecast", getWeatherForecast);

// Dashboard routes
router.get("/home", getVisitorDashboard);
router.get("/", weatherDetails)

export default router;
