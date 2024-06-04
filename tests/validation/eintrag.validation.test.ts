import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { EintragResource } from "../../src/Resources";
import { dateToString } from "../../src/services/ServiceHelper";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag, getEintrag } from "../../src/services/EintragService";
import { toHaveValidationErrorsExactly } from "restmatcher/lib/responseMatcher";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idMax: string;
let idProt: string;
let idEntry: string;
const pwMax = "?Que-P4s4"

beforeEach(async () => {
    const max = await createPfleger({name: "Max", password: pwMax, admin: false});
    idMax = max.id!;
    const prot = await createProtokoll({patient: "Gudrun", datum: "05.05.2023", ersteller: idMax})
    idProt = prot.id!; 
    const entryRes: EintragResource = { ersteller: idMax, getraenk: "Milch", menge: 200, protokoll: idProt }
    const entry = await createEintrag(entryRes);
    idEntry = entry.id!;
})

test("Eintrag GET, ID not MongoID", async () => {
    const testee = supertest(app);
    const get = await testee.get(`/api/eintrag/1234`);

    expect(get).toHaveValidationErrorsExactly({ status: "400", params: "id" });
})

test("Eintrag POST", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const entry: EintragResource = { getraenk: "Wasser", ersteller: "Peter", menge: 200, protokoll: idProt, kommentar: "kp" }
    const post = await testee.post("/api/eintrag").send(entry);

    expect(post).toHaveValidationErrorsExactly({status: "400", body: "ersteller"});
})

test("Eintrag PUT, id not the same", async () => {
    const entryData: EintragResource = { getraenk: "Milch", menge: 200, ersteller: idMax, protokoll: idProt}
    const entry = await createEintrag(entryData);
    const idEntry = entry.id;
    const fakeData = await getEintrag(idEntry!);
    fakeData.id = idMax;
    fakeData.getraenk = "Wein"

    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const put = await testee.put(`/api/eintrag/${idEntry}`).send(fakeData)
    expect(put).toHaveValidationErrorsExactly({ status: "400", body: "id", params: "id"})
})

test("/api/eintrag DELETE, invalid ID", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const get = await testee.delete(`/api/eintrag/12345/`)
    expect(get).toHaveValidationErrorsExactly({ status:"400", params: "id" })
})

test("/api/eintrag PUT entry, ID same but not from an entry", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const fakeData: EintragResource = {"id": idProt, "getraenk": "Milch",
    "ersteller": idMax,
    "protokoll": idProt,
    "menge": 200}
    const update = await testee.put(`/api/eintrag/${idProt}`).send(fakeData);
    
    expect(update.statusCode).toBe(404)
})
test("/api/eintrag POST entry, ersteller ID not from a Pfleger", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const fakeData: EintragResource = {"id": idProt, "getraenk": "Milch",
    "ersteller": idProt,
    "protokoll": idProt,
    "menge": 200}
    const create = await testee.post(`/api/eintrag/`).send(fakeData);
    
    expect(create.statusCode).toBe(400)
})

test("/api/eintrag POST, menge zu klein", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const tooLittle: EintragResource = {"getraenk": "Milch",
    "ersteller": idMax,
    "protokoll": idProt,
    "menge": 0}

    const create = await testee.post("/api/eintrag/").send(tooLittle);
    expect(create.statusCode).toBe(400);
})

test("/api/eintrag POST, menge zu groß", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const tooMuch: EintragResource = {"getraenk": "Milch",
    "ersteller": idMax,
    "protokoll": idProt,
    "menge": 500000}

    const create = await testee.post("/api/eintrag/").send(tooMuch);
    expect(create.statusCode).toBe(400);
})

test("/api/eintrag PUT, menge zu klein", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const tooLittle: EintragResource = {"id": idEntry, 
    "getraenk": "Milch",
    "ersteller": idMax,
    "protokoll": idProt,
    "menge": 0}

    const update = await testee.put(`/api/eintrag/${idEntry}`).send(tooLittle);
    expect(update.statusCode).toBe(400);
})

test("/api/eintrag PUT, menge zu groß", async () => {
    await performAuthentication("Max", pwMax);
    const testee = supertestWithAuth(app);
    const tooMuch: EintragResource = {"id": idEntry,
    "getraenk": "Milch",
    "ersteller": idMax,
    "protokoll": idProt,
    "menge": 500000}

    const update = await testee.put(`/api/eintrag/${idEntry}`).send(tooMuch);
    expect(update.statusCode).toBe(400);
    expect(update).toHaveValidationErrorsExactly({ status: 400, body: "menge" })
})