// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";
import { Pfleger } from "../../src/model/PflegerModel";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pomfrey: PflegerResource
let fredsProtokoll: ProtokollResource
let idPfleger: string

beforeEach(async () => {
    pomfrey = await createPfleger({
        name: "Poppy Pomfrey", password: "12345bcdABCD..;,.", admin: false
    });
    fredsProtokoll = await createProtokoll({
        patient: "Fred Weasly", datum: "01.10.2023",
        public: true, closed: false,
        ersteller: pomfrey.id!
    })
    const max = await createPfleger({name: "Max", password: "1234§$aBc", admin: false})
    idPfleger = max.id!
})

test("/api/protokoll GET, ungültige ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/1234`)

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id" })
})

test("/api/protokoll PUT, verschiedene ID (params und body)", async () => {
    await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    // const testee = supertest(app);
    // Hint: Gültige ID, aber für ein Protokoll ungültig!
    const invalidProtokollID = pomfrey.id;
    // Hint: Gebe hier Typ an, um im Objektliteral Fehler zu vermeiden!
    const update: ProtokollResource = { 
        ...fredsProtokoll, // Hint: Kopie von fredsProtokoll
        id: invalidProtokollID, // wir "überschreiben" die ID
        patient: "George Weasly" // und den Patienten
    }
    const response = await testee.put(`/api/protokoll/${fredsProtokoll.id}`).send(update);

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id", body: "id" })
});

test("/api/protokoll POST, invalid ersteller ID (mit Anmeldung)", async () => {
    // const testee = supertest(app);
    await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    const prot: ProtokollResource = {
        patient: "Gudrun",
        datum: "12.12.2023",
        ersteller: "1234",
    }
    const post = await testee.post(`/api/protokoll`).send(prot)
    expect(post).toHaveValidationErrorsExactly({ status:"400", body: "ersteller" })
})

test("/api/protokoll POST, invalid ersteller ID (ohne Anmeldung)", async () => {
    const testee = supertest(app);
    const prot: ProtokollResource = {
        patient: "Gudrun",
        datum: "12.12.2023",
        ersteller: "1234",
    }
    const post = await testee.post(`/api/protokoll`).send(prot)
    expect(post.statusCode).toBe(401);
})

test("/api/protokoll POST, name too long (mit Anmeldung)", async () => {
    await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    const prot: ProtokollResource = {
        patient: "Gudrun".repeat(100),
        datum: "12.12.2023",
        ersteller: fredsProtokoll.id!,
    }
    const post = await testee.post(`/api/protokoll`).send(prot)
    expect(post).toHaveValidationErrorsExactly({ status:"400", body: "patient" })
})

test("/api/protokoll POST, name too long (ohne Anmeldung)", async () => {
    
    const testee = supertest(app);
    const prot: ProtokollResource = {
        patient: "Gudrun".repeat(100),
        datum: "12.12.2023",
        ersteller: fredsProtokoll.id!,
    }
    const post = await testee.post(`/api/protokoll`).send(prot)
    expect(post.statusCode).toBe(401);
})

test("/api/protokoll GET, invalid ID", async () => {
    const testee = supertest(app);
    const get = await testee.get(`/api/protokoll/12345/eintraege`)
    expect(get).toHaveValidationErrorsExactly({ status:"400", params: "id" })
})

test("/api/protokoll DELETE, invalid ID (ohne Anmeldung)", async () => {
    const testee = supertest(app);
    const get = await testee.delete(`/api/protokoll/12345/`)
    expect(get).toHaveValidationErrorsExactly({ status:"401" })
})

test("/api/protokoll DELETE, invalid ID (mit Anmeldung)", async () => {
    await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    const get = await testee.delete(`/api/protokoll/12345/`)
    expect(get).toHaveValidationErrorsExactly({ status:"400", params: "id" })
})

test("/api/protokoll POST, ersteller is MongoID, but no pfleger with that ID in DB\
        (mit Anmeldung)", async () => {
    await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    const protRes: ProtokollResource = { ersteller: fredsProtokoll.id!, datum: "01.04.2023", patient: "Gudrun"};
    
    const post = await testee.post(`/api/protokoll/`).send(protRes);
    expect(post.statusCode).toBe(403);
    // expect(post).toHaveValidationErrorsExactly({ status: "400", body: "ersteller"})
})

test("/api/protokoll POST, ersteller is MongoID, but no pfleger with that ID in DB\
(ohne Anmeldung) ", async () => {
    const testee = supertest(app);
    const protRes: ProtokollResource = { ersteller: fredsProtokoll.id!, datum: "01.04.2023", patient: "Gudrun"};
    
    const post = await testee.post(`/api/protokoll/`).send(protRes);
    expect(post.statusCode).toBe(401);
})

test("POST, ersteller not existing (mit Anmeldung)", async () => {
    await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
    await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
    const testee = supertestWithAuth(app);
    await Pfleger.deleteMany().exec()
    const protRes: ProtokollResource = {
        patient: "Gudrun",
        datum: "12.12.2023",
        ersteller: idPfleger
    }
    const post = await testee.post("/api/protokoll").send(protRes);
    expect(post.statusCode).toBe(403);
    // expect(post).toHaveValidationErrorsExactly({ status: 400, body: "ersteller"});
})

test("POST, ersteller not existing (ohne Anmeldung)", async () => {
    await Pfleger.deleteMany().exec()
    const protRes: ProtokollResource = {
        patient: "Gudrun",
        datum: "12.12.2023",
        ersteller: idPfleger
    }
    const testee = supertest(app);
    const post = await testee.post("/api/protokoll").send(protRes);
    expect(post.statusCode).toBe(401);
})