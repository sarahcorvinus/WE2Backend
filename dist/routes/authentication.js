"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthentication = exports.requiresAuthentication = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = require("jsonwebtoken");
function requiresAuthentication(req, res, next) {
    // throw new Error("Function requiresAuthentication not implemented yet")
    const cookie = req.cookies.access_token;
    if (!cookie)
        res.clearCookie("access_token").sendStatus(401);
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET not set!");
    try {
        const jwt = (0, jsonwebtoken_1.verify)(cookie, secret);
        const payload = jwt;
        // SHOULD already be checked by the verify function:
        // if(payload.exp! * 1000 < new Date().getTime())
        //     res.clearCookie("access_token").sendStatus(401);
        req.pflegerId = payload.sub;
        req.role = payload.role;
        next();
    }
    catch (error) {
        res.clearCookie("access_token").status(401);
        next(error);
    }
}
exports.requiresAuthentication = requiresAuthentication;
function optionalAuthentication(req, res, next) {
    // throw new Error("Function requiresAuthentication not implemented yet")
    const cookie = req.cookies.access_token;
    if (cookie) {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET not set!");
        try {
            const jwt = (0, jsonwebtoken_1.verify)(cookie, secret);
            const payload = jwt;
            // if(payload.exp! * 1000 < new Date().getTime()) {
            //     res.clearCookie("access_token").sendStatus(401);
            //     return;
            // }
            req.pflegerId = payload.sub;
            req.role = payload.role;
            // next(); // <-- apparently not needed (here) or sth
        }
        catch (error) {
            res.clearCookie("access_token").status(401);
            next(error);
        }
    }
    res.status(200);
    next();
}
exports.optionalAuthentication = optionalAuthentication;
//# sourceMappingURL=authentication.js.map