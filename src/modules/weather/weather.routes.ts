import express from "express";
import {
  getCurrentWeather,
  getWeatherForecast,
  getVisitorDashboard,
  getClientCurrentWeather,
  getClientWeatherForecast,
} from "./weather.controller.js";

const router = express.Router();

// API routes
router.get("/current", getCurrentWeather);
router.get("/forecast", getWeatherForecast);

// Dashboard routes
router.get("/home", getVisitorDashboard);
router.get("/client/current", getClientCurrentWeather);
router.get("/client/forecast", getClientWeatherForecast); 

export default router;
