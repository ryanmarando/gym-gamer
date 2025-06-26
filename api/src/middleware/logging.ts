import { Request, Response, NextFunction } from "express";

const logRequest = (req: Request, res: Response, next: NextFunction) => {
    switch (req.method) {
        case "GET":
            console.log(`GET to ${req.path}`);
            next();
            return;
        case "POST":
            console.log(`POST to ${req.path}`);
            next();
            break;
        case "DELETE":
            console.log(`DELETE to ${req.path}`);
            next();
            break;
        case "PATCH":
            console.log(`PATCH to ${req.path}`);
            next();
            break;
    }
};

export default { logRequest };
