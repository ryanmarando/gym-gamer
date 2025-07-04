import xss from "xss";
import { Request, Response, NextFunction } from "express";

const sanitize = (obj: any): any => {
    const options = {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"],
    };

    for (const key in obj) {
        if (typeof obj[key] === "string") {
            obj[key] = xss(obj[key], options);
        } else if (typeof obj[key] === "object") {
            obj[key] = sanitize(obj[key]);
        }
    }
    return obj;
};

const xssMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitize(req.body);
    }
    next();
};

export default xssMiddleware;
