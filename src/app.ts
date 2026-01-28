import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import weatherRoute from "./modules/weather.routes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("views", "views");

app.use("/api/weather", weatherRoute);

app.use(errorHandler);

export default app;
