// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { PflegerResource } from "../../src/Resources";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idPfleger: string
let idProt: string
let pwMax = "Th!s1sS4fe"

beforeEach(async () => {
    const pfleger = await createPfleger({name: "Max", password: pwMax, admin: true})
    idPfleger = pfleger.id!;
    const prot = await createProtokoll({patient: "Gudrun", datum: "12.12.2023", ersteller: idPfleger})
    idProt = prot.id!;
})

test("pflegerRouter DELETE fake ID", async () => {
    await performAuthentication("Max", pwMax)
    const testee = supertestWithAuth(app);
    const del = await testee.delete(`/api/pfleger/12345`)

    expect(del).toHaveValidationErrorsExactly({status: 400, params: "id"})
})

test("pflegerRouter POST name too long", async () => {
    await performAuthentication("Max", pwMax)
    const testee = supertestWithAuth(app);
    const pfleger: PflegerResource = {name: "Max".repeat(100), admin: false, password: "1234*%&abGE"};

    const post = await testee.post("/api/pfleger").send(pfleger);
    expect(post).toHaveValidationErrorsExactly({ status: 400, body: "name"})
})

test("pflegerRouter PUT ID not same", async () => {
    await performAuthentication("Max", pwMax)
    const testee = supertestWithAuth(app);
    const put = await testee.put(`/api/pfleger/${idProt}`).send({name: "Maik", password: "1234*%&abGE", id: idPfleger, admin: false})

    expect(put).toHaveValidationErrorsExactly({status: 400, params: "id", body:"id"})
})

test("pflegerRouter Pfleger name already there", async () => {
    await performAuthentication("Max", pwMax)
    const testee = supertestWithAuth(app);
    const post = await testee.post(`/api/pfleger/`).send({name: "Max", password: "1234*%&abGE", id: idPfleger, admin: false})

    expect(post.statusCode).toBe(400)
    expect(post).toHaveValidationErrorsExactly({ status: 400, body: "name"})
})


test("pflegerRouter POST, name already there", async () => {
    await performAuthentication("Max", pwMax)
    const testee = supertestWithAuth(app);
    const pfleger: PflegerResource = { name: "Max", password: "1234S4fe?!**", admin: false};

    const post = await testee.post("/api/pfleger/").send(pfleger);
    expect(post).toHaveValidationErrorsExactly({ status: 400, body: "name" })
})