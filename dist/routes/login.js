"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
// import dotenv from "dotenv";
// dotenv.config();
const express_1 = __importDefault(require("express"));
const JWTService_1 = require("../services/JWTService");
const AuthenticationService_1 = require("../services/AuthenticationService");
exports.loginRouter = express_1.default.Router();
exports.loginRouter.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    const password = req.body.password;
    try {
        // const jwt = await verifyPasswordAndCreateJWT(name, password);
        const loginAttempt = yield (0, AuthenticationService_1.login)(name, password);
        if (loginAttempt) {
            const jwtTokenString = yield (0, JWTService_1.verifyPasswordAndCreateJWT)(name, password);
            const payload = (0, JWTService_1.verifyJWT)(jwtTokenString);
            res.cookie("access_token", jwtTokenString, { httpOnly: true, secure: true, sameSite: "none", expires: new Date(payload.exp * 1000) });
        }
        res.send(loginAttempt);
    }
    catch (e) {
        res.status(500);
        next(e);
    }
}));
exports.loginRouter.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jwt = req.cookies.access_token;
    if (!jwt) {
        res.clearCookie("access_token");
        res.status(401).send(false);
    }
    if (jwt.exp * 1000 < Date.now()) {
        res.clearCookie("access_token");
        res.status(401).send(false);
    }
    try {
        const login = (0, JWTService_1.verifyJWT)(jwt);
        res.send(login);
    }
    catch (e) {
        res.clearCookie("access_token");
        res.sendStatus(500);
    }
}));
exports.loginRouter.delete("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("access_token");
    res.sendStatus(204);
}));
//# sourceMappingURL=login.js.map