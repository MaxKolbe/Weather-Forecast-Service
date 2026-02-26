import request from "supertest";
import app from "../../../app";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

if (process.env.NODE_ENV !== "test") {
  console.log("NODE ENVIRONMENT:", process.env.NODE_ENV);
  throw new Error("Tests are not running in test environment!");
}

describe("WEATHER ROUTES", () => {
  it("should return the current weather for a city", async () => {
    const response = await request(app).get("/api/v1/weather/current?city=enugu")
    expect(response.status).toBe(200)
  });

  it("should return the forecast for a city", async () => {
    const response = await request(app).get("/api/v1/weather/forecast?city=awka")
    expect(response.status).toBe(200)
  });
});
