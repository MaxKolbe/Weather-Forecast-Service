import { Request, Response, NextFunction } from "express";
import logger from "../configs/logger.config";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // console.log(`Internal Server Error: ${err.stack} \n`);
  logger.error(`Internal Server Error: ${err.stack} \n`);
  logger.info("INTERNAL SERVER ERROR CAUSE:", err.cause);
  res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    error: err.message,
  });
};

export default errorHandler;
 