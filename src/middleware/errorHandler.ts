import { Request, Response, NextFunction } from "express";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(`Internal Server Error: ${err.stack} \n`);
  res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    error: err.message,
  });
};

export default errorHandler;
