import express from "express";
import {
  getCurrentWeather,
  getWeatherForecast,
  getClientCurrentWeather,
  getClientWeatherForecast,
} from "./weather.controller.js";

const router = express.Router();

// API routes
router.get("/current", getCurrentWeather);
router.get("/forecast", getWeatherForecast);

// Dashboard routes
router.get("/home", getClientCurrentWeather)
router.get("/client/current", getClientWeatherForecast);
router.get("/client/forecast", getClientWeatherForecast);

export default router;
