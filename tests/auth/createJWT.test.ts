import dotenv from "dotenv";
dotenv.config();

import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService"
import { createPfleger } from "../../src/services/PflegerService"
import { stringToDate } from "../../src/services/ServiceHelper";

const maxPW = "123!§$aBc";
let idMax: string;
beforeEach(async () => {
    const max = await createPfleger({name: "Max", password: maxPW, admin: false})
    idMax = max.id!;
})

test("create JWT",  async () => {
    const jwt = await verifyPasswordAndCreateJWT("Max", maxPW);
    expect(jwt).toBeDefined();
})

test("verifyJWT Test", async () => {
    const jwt = await verifyPasswordAndCreateJWT("Max", maxPW);
    const verify = verifyJWT(jwt);
    // expect(verify).toEqual({ id: idMax, role: "u", exp: stringToDate("12.12.2023").getTime()/1000})
    expect(verify).toMatchObject({ id: idMax, role: "u"})
})

test("verifyPasswordAndCreateJWT test, password wrong", async () => {
    const jwt = await verifyPasswordAndCreateJWT("Max", "2134%&/aBc");
    expect(jwt).toBeUndefined();
})

test("verifyPasswordAndCreateJWT test, non-existing Pfleger", async () => {
    const jwt = await verifyPasswordAndCreateJWT("Mich jibt's nicht", "2134%&/aBc");
    expect(jwt).toBeUndefined();
})

test("verifyPasswordAndCreateJWT test, JWT_SECRET not set", async () => {
    process.env.JWT_SECRET = "";
    await expect(verifyPasswordAndCreateJWT("Max", maxPW)).rejects.toThrow("JWT_SECRET not set!");
})
