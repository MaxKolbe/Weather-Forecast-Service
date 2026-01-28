import express from "express"
import { getCurrentWeather, getWeatherForecast } from "./weather.controller.js"

const router = express.Router()

// API routes
router.get("/current", getCurrentWeather)
router.get("/forecast", getWeatherForecast)

export default router