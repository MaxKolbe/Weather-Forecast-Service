import { Response } from "express";

const responseHandler = (message: string, res: Response, status: number, data: any = null) => {
    res.status(status).json({
        status,
        message,
        data
    }); 
}

export default responseHandler