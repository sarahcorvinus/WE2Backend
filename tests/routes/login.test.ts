import dotenv from "dotenv";
dotenv.config();

import supertest from "supertest";
import { createPfleger } from "../../src/services/PflegerService"
import app from "../../src/app";

let maxPW: string = "S!cheresPW@@123";
let idMax: string;
beforeEach(async () => {
    const max = await createPfleger({ name: "Max", password: maxPW, admin: false });
    idMax = max.id!;
})

test("loginRouter POST test", async () => {
    const testee = supertest(app);
    const post = await testee.post("/api/login/").send({"name": "Max", "password": maxPW});

    expect(post.statusCode).toBe(200);
    expect(post.body.id).toEqual(idMax);
    expect(post.body.role).toEqual("u");
})

test("loginRouter POST test, false pw", async () => {
    const testee = supertest(app);
    const post = await testee.post("/api/login/").send({"name": "Max", "password": "1234§$aBc"});

    expect(post.statusCode).toBe(200);
    expect(post.body).toEqual(false);
})

test("loginRouter POST test, non-existent name", async () => {
    const testee = supertest(app);
    const post = await testee.post("/api/login/").send({"name": "Petra", "password": "1234§$aBc"});

    expect(post.statusCode).toBe(200);
    expect(post.body).toEqual(false);
})