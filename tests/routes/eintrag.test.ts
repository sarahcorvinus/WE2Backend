import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag } from "../../src/services/EintragService";
import { dateToString, stringToDate } from "../../src/services/ServiceHelper";
import { Eintrag } from "../../src/model/EintragModel";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idBehrens: string
let idProtokoll: string
let idEntry: string
let pwBehrens = "GehÄ!m123"
const behrens = "Hofrat Behrens"

beforeEach(async () => {
    const behrensRes = await createPfleger({ name: behrens, password: pwBehrens, admin: false })
    idBehrens = behrensRes.id!;
    const protokoll = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    idProtokoll = protokoll.id!;
    const privateProt = await createProtokoll({patient: "Gudrun", datum: "01.01.1976", ersteller: idBehrens, public: false});
    const entry = await createEintrag({getraenk: "Wasser", menge: 50, ersteller: idBehrens, protokoll: idProtokoll});
    idEntry = entry.id!;
})

test("/api/eintrag get einen Eintrag holen", async () => {
    const testee = supertest(app);
    const get = await testee.get(`/api/eintrag/${idEntry}`);

    expect(get.statusCode).toBe(200);
})

test("/api/eintrag get fake ID", async () => {
    const testee = supertest(app);
    const get = await testee.get(`/api/eintrag/${idProtokoll}`);

    expect(get.statusCode).toBe(404);
})

test("/api/eintrag POST a new entry (ohne Anmeldung)", async () => {
    const testee = supertest(app);
    const create = await testee.post("/api/eintrag").send({"getraenk": "Milch",
    "menge": 50,
    "datum": new Date,
    "ersteller": idBehrens,
    "protokoll": idProtokoll})

    expect(create.statusCode).toBe(401)
    // expect(create.body.getraenk).toBe("Milch");
})

test("/api/eintrag POST a new entry (mit Anmeldung)", async () => {
    await performAuthentication(behrens, pwBehrens);
    const testee = supertestWithAuth(app);
    const create = await testee.post("/api/eintrag").send({"getraenk": "Milch",
    "menge": 50,
    "datum": new Date,
    "ersteller": idBehrens,
    "protokoll": idProtokoll})

    expect(create.statusCode).toBe(201)
    expect(create.body.getraenk).toBe("Milch");
})

test("/api/eintrag POST a new entry, menge missing", async () => {
    await performAuthentication(behrens, pwBehrens);
    const testee = supertestWithAuth(app);
    const create = await testee.post("/api/eintrag").send({"getraenk": "Milch",
    "datum": new Date,
    "ersteller": idBehrens,
    "protokoll": idProtokoll})
    
    expect(create.statusCode).toBe(400)
})

test("/api/eintrag PUT update of an entry", async () => {
    await performAuthentication(behrens, pwBehrens);
    const testee = supertestWithAuth(app);
    const update = await testee.put(`/api/eintrag/${idEntry}`).send({
        id: idEntry,
        getraenk: "Wasser",
        ersteller: idBehrens,
        protokoll: idProtokoll,
        menge:200});
    
    expect(update.statusCode).toBe(200)
    expect(update.body.menge).toBe(200)
})

test("/api/eintrag PUT update non-matching ID", async () => {
    await performAuthentication(behrens, pwBehrens);
    const testee = supertestWithAuth(app);
    const update = await testee.put(`/api/eintrag/${idEntry}`).send({"id": idProtokoll,
    "menge":200});
    
    expect(update.statusCode).toBe(400)
})

/* test("/api/eintrag PUT update non-existent ID", async () => {
    const testee = supertest(app);
    const update = await testee.put(`/api/eintrag/${idProtokoll}`).send({"id": idProtokoll,
    "menge":200});
    
    expect(update.statusCode).toBe(404)
}) */

test("/api/eintrag DELETE of an entry", async () => {
    await performAuthentication(behrens, pwBehrens);
    const testee = supertestWithAuth(app);
    const del = await testee.delete(`/api/eintrag/${idEntry}`);

    expect(del.statusCode).toBe(204);
    const nr = await Eintrag.find().exec();
    expect(nr.length).toBe(0);
})

test("/api/eintrag DELETE of non-existent entry", async () => {
    await performAuthentication(behrens, pwBehrens);
    const testee = supertestWithAuth(app);
    const del = await testee.delete(`/api/eintrag/${idProtokoll}`);

    expect(del.statusCode).toBe(404);
})