import app from "./app.js";
import logger from "./configs/logger.config.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}/api/v1/weather`);
});
