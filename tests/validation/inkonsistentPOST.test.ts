import supertest from "supertest"
import app from "../../src/app"
import { createPfleger } from "../../src/services/PflegerService"
import { createProtokoll } from "../../src/services/ProtokollService"
import { ProtokollResource } from "../../src/Resources"
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth"

let idPfleger: string

// TODO add login/auth
test("POST datePatientConstraint", async () => {
    const pfleger = await createPfleger({name : "Max", admin: false, password: "1234!%Qwe"});
    if(!pfleger) {
        throw new Error("lol")
    }
    idPfleger = pfleger.id!
    const protRes: ProtokollResource = {ersteller: idPfleger, patient: "Gudrun", datum: "02.02.2023"}
    await createProtokoll(protRes);
    await performAuthentication("Max", "1234!%Qwe");
    const testee = supertestWithAuth(app);
    const post = await testee.post("/api/protokoll/").send(protRes);
    
    // SHOULDNT BE 201
    // expect(post.statusCode).toBe(201);
    
    // SHOULD BE 400
    expect(post.statusCode).toBe(400);
})

test("createProtokoll datePatientConstraint does work", async () => {
    const pfleger = await createPfleger({name : "Max", admin: false, password: "1234!%Qwe"})
    idPfleger = pfleger.id!
    const protRes: ProtokollResource = {ersteller: idPfleger, patient: "Gudrun", datum: "02.02.2023"}
    await createProtokoll(protRes);
    
    expect(async () => await createProtokoll(protRes)).rejects.toThrow("There is already a Protokoll for that date for patient Gudrun");
})