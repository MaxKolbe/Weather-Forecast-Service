import express from "express";
import {
  getCurrentWeather,
  getWeatherForecast,
  getVisitorDashboard,
  weatherDetails,
} from "./weather.controller.js";  

// import {rateLimit} from "express-rate-limit";
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
// 	limit: 20, // 2o requests per 15 minute window
// 	legacyHeaders: false, 
//   message: "Too many requests. Try again"
// })

const router = express.Router();

// API routes
router.get("/current", getCurrentWeather);   
router.get("/forecast", getWeatherForecast); 

// Dashboard routes
router.get("/home", getVisitorDashboard);
router.get("/", weatherDetails)

export default router;
