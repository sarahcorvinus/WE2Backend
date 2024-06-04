import dotenv from "dotenv"
dotenv.config();

import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

declare global {
    namespace Express {
        export interface Request {
            /**
             * Mongo-ID of currently logged in pfleger; or undefined, if pfleger is a guest.
             */
            pflegerId?: string;
            /**
             * Role of currently logged in pfleger; or undefined, if pfleger is a guest.
             */
            role?: "u" | "a";
        }
    }
}

export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    // throw new Error("Function requiresAuthentication not implemented yet")
    const cookie = req.cookies.access_token;
    if(!cookie)
        res.clearCookie("access_token").sendStatus(401);
    
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error("JWT_SECRET not set!");
    
    try {
        const jwt = verify(cookie, secret);
        const payload = jwt as JwtPayload;
        
        // SHOULD already be checked by the verify function:
        // if(payload.exp! * 1000 < new Date().getTime())
        //     res.clearCookie("access_token").sendStatus(401);

    req.pflegerId = payload.sub;
    req.role = payload.role;
    next();
    } catch (error) {
        res.clearCookie("access_token").status(401);
        next(error);
    }
    
}

export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    // throw new Error("Function requiresAuthentication not implemented yet")
    const cookie = req.cookies.access_token;
    if(cookie) {
        const secret = process.env.JWT_SECRET;
        if(!secret) throw new Error("JWT_SECRET not set!");
        
        try {
            const jwt = verify(cookie, secret);
            const payload = jwt as JwtPayload;
            // if(payload.exp! * 1000 < new Date().getTime()) {
            //     res.clearCookie("access_token").sendStatus(401);
            //     return;
            // }
            req.pflegerId = payload.sub;
            req.role = payload.role;
            // next(); // <-- apparently not needed (here) or sth
        } catch (error) {
            res.clearCookie("access_token").status(401);
            next(error);
        }
    }
    res.status(200);
    next();
}
