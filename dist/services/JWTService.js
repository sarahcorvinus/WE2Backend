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
exports.verifyJWT = exports.verifyPasswordAndCreateJWT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = require("jsonwebtoken");
const PflegerModel_1 = require("../model/PflegerModel");
const AuthenticationService_1 = require("./AuthenticationService");
function verifyPasswordAndCreateJWT(name, password) {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv_1.default.config();
        // throw new Error("Function verifyPasswordAndCreateJWT not implemented yet")
        const pfleger = yield PflegerModel_1.Pfleger.findOne({ name: name }).exec();
        if (!pfleger)
            return undefined;
        // // const isCorrectPW = await pfleger.isCorrectPassword(password);
        // // if(!isCorrectPW) throw new Error("Password or name incorrect");
        const loginAttempt = yield (0, AuthenticationService_1.login)(name, password);
        if (loginAttempt === false)
            return undefined;
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET not set!");
        let ttl = process.env.JWT_TTL;
        if (!ttl)
            throw new Error("TTL not set!");
        ttl = parseInt(ttl);
        // const expiryDate = Math.floor(Date.now()/1000) + ttl;
        // const expiryDate = Math.floor(stringToDate("09.12.2023").getTime()/1000);
        const expiresIn = ttl;
        const payload = {
            sub: pfleger.id,
            // exp: expiryDate,
            role: loginAttempt.role,
        };
        const jwtString = (0, jsonwebtoken_1.sign)(payload, secret, {
            expiresIn: ttl,
            algorithm: "HS256"
        });
        //const fs = require('fs');
        //fs.writeFileSync("./jwtTest/jwt.txt", jwtString);
        return jwtString;
    });
}
exports.verifyPasswordAndCreateJWT = verifyPasswordAndCreateJWT;
function verifyJWT(jwtString) {
    dotenv_1.default.config();
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET not set!");
    if (!jwtString)
        throw new Error("jwtString not found!");
    const payload = (0, jsonwebtoken_1.verify)(jwtString, secret);
    let pflegerId;
    let role;
    let exp;
    // got this from SU SS2023 Unterlagen
    if (typeof (payload) === "object") { // hack to access properties cleanly; to not have 'sub' be a HTML element
        pflegerId = payload.sub;
        role = payload.role;
        exp = payload.exp;
    }
    const login = {
        id: pflegerId,
        role: role,
        exp: exp
    };
    return login;
}
exports.verifyJWT = verifyJWT;
/* async function make(): Promise<void> {
    await verifyPasswordAndCreateJWT("Max", "geheim");
};
make(); */ 
//# sourceMappingURL=JWTService.js.map