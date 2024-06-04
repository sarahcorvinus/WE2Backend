import dotenv from "dotenv"
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { LoginResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { login } from "./AuthenticationService";
import { writeFile } from "fs/promises";
import { createPfleger } from "./PflegerService";
import { stringToDate } from "./ServiceHelper";

export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
    dotenv.config();
    // throw new Error("Function verifyPasswordAndCreateJWT not implemented yet")
    const pfleger = await Pfleger.findOne({name: name}).exec()
    if(!pfleger) return undefined;
    
    // // const isCorrectPW = await pfleger.isCorrectPassword(password);
    // // if(!isCorrectPW) throw new Error("Password or name incorrect");
    const loginAttempt = await login(name, password);
    if(loginAttempt === false) return undefined;
    
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error("JWT_SECRET not set!")
    
    let ttl: string | number | undefined = process.env.JWT_TTL;
    if(!ttl) throw new Error("TTL not set!")
    ttl = parseInt(ttl);

    // const expiryDate = Math.floor(Date.now()/1000) + ttl;
    // const expiryDate = Math.floor(stringToDate("09.12.2023").getTime()/1000);
    const expiresIn = ttl;
    const payload: JwtPayload = {
        sub: pfleger.id, 
        // exp: expiryDate,
        role: loginAttempt.role,
    }
    const jwtString = sign(
        payload,
        secret,
        {
            expiresIn: ttl,
            algorithm: "HS256"
        }
    )
    //const fs = require('fs');
    //fs.writeFileSync("./jwtTest/jwt.txt", jwtString);
    return jwtString;
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
    dotenv.config();
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error("JWT_SECRET not set!");
    
    if(!jwtString) throw new Error("jwtString not found!");
    const payload = verify(jwtString, secret);
    let pflegerId;
    let role;
    let exp;
    // got this from SU SS2023 Unterlagen
    if(typeof(payload) === "object"){ // hack to access properties cleanly; to not have 'sub' be a HTML element
        pflegerId = payload.sub;
        role = payload.role;
        exp = payload.exp;
    }
    const login: LoginResource = {
        id: pflegerId!,
        role: role,
        exp: exp!
    }

    return login;
}

/* async function make(): Promise<void> {
    await verifyPasswordAndCreateJWT("Max", "geheim");
};
make(); */