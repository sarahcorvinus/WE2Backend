import { HydratedDocument } from "mongoose"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { createProtokoll, getAlleProtokolle, getProtokoll } from "../../src/services/ProtokollService";
import { dateToString, stringToDate } from "../../src/services/ServiceHelper";
import supertest from "supertest";
import app from "../../src/app";
import { Protokoll } from "../../src/model/ProtokollModel";
import { Eintrag } from "../../src/model/EintragModel";
import { createPfleger } from "../../src/services/PflegerService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pfleger: HydratedDocument<IPfleger>;
let pflegerID: string;
beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Max", password: "1234"})
    pflegerID = pfleger.id;
})

afterEach(async () => {
    await Pfleger.deleteMany().exec()
    await Protokoll.deleteMany().exec()
    await Eintrag.deleteMany().exec()
})

test("POST should return ID (mit Anmeldung)", async () => {
    const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    const post = await testee.post("/api/protokoll").send({patient: "Gudrun", datum: dateToString(stringToDate("2023-01-01")), ersteller: peter.id!})
    expect(post.statusCode).toBe(201)
    expect(post.body.id).toBeDefined()
    expect(post.body.id).not.toBeUndefined()
    const findProt = await Protokoll.find().exec()
    const ourFindProt = findProt[0]
    expect(post.body.id).toBe(ourFindProt.id)
})

test("POST should return ID (ohne Anmeldung)", async () => {
    const testee = supertest(app)
    const post = await testee.post("/api/protokoll").send({patient: "Gudrun", datum: dateToString(stringToDate("2023-01-01")), ersteller: pflegerID})
    expect(post.statusCode).toBe(401)
    expect(post.body.id).toBeUndefined();
})

/* not needed anymore 
test("sanity-check: GET should return ID", async () => {
    const prot = await Protokoll.create({patient: "Gudrun", datum: dateToString(stringToDate("2023-01-02")), ersteller: pflegerID})
    const idProt = prot.id;
    const testee = supertest(app);
    const get = await testee.get(`/api/protokoll/${idProt}`)
    expect(get.statusCode).toBe(200)
    expect(get.body.id).toBe(idProt)
}) */

test("GET and POST should return ID (mit Anmeldung)", async () => {
    const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    const post = await testee.post("/api/protokoll").send({patient: "Gudrun", datum: dateToString(stringToDate("2023-01-01")), ersteller: peter.id!})
    const postID = post.body.id;
    expect(post.statusCode).toBe(201)
    const get = await getProtokoll(postID);
    const getID = get.id;

    expect(getID).toBe(postID);
})

test("GET and POST should return ID (ohne Anmeldung)", async () => {
    const testee = supertest(app);
    const post = await testee.post("/api/protokoll").send({patient: "Gudrun", datum: dateToString(stringToDate("2023-01-01")), ersteller: pflegerID})
    const postID = post.body.id;
    expect(post.statusCode).toBe(401)
    expect(async()=>await getProtokoll(postID)).rejects.toThrow();
    // const getID = get.id;
    // expect(getID).toBe(postID);
})

test("createProtokoll should return ID", async () => {
    const create = await createProtokoll({patient: "Gudrun", datum: dateToString(stringToDate("2023-01-01")), ersteller: pflegerID});
    const createID = create.id;

    const get = await getProtokoll(createID!);

    expect(createID).toBe(get.id);
})