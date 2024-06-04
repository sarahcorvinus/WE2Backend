// import dotenv from "dotenv";
// dotenv.config();
import express from "express";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";
import { login } from "../services/AuthenticationService";

export const loginRouter = express.Router();

loginRouter.post("/", async (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;
    try {
        // const jwt = await verifyPasswordAndCreateJWT(name, password);
        const loginAttempt = await login(name, password);
        if(loginAttempt) {
            const jwtTokenString = await verifyPasswordAndCreateJWT(name, password);
            const payload = verifyJWT(jwtTokenString);
            res.cookie("access_token", jwtTokenString, {httpOnly: true, secure: true, sameSite: "none", expires: new Date(payload.exp*1000)});
        }
        res.send(loginAttempt);
    } catch (e) {
        res.status(500);
        next(e);
    }
});

loginRouter.get("/", async (req, res, next) => {
    const jwt = req.cookies.access_token;

    if(!jwt) {
        res.clearCookie("access_token");
        res.status(401).send(false);
    }
    if(jwt.exp*1000 < Date.now()) {
        res.clearCookie("access_token");
        res.status(401).send(false);
    }

    try {
        const login = verifyJWT(jwt);
        res.send(login);
    } catch (e) {
        res.clearCookie("access_token");
        res.sendStatus(500);
    }
})

loginRouter.delete("/", async (req, res, next) => {
    res.clearCookie("access_token");
    res.sendStatus(204);
})