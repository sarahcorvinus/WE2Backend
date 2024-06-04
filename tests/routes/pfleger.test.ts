import supertest from "supertest";
import app from "../../src/app";
import { createPfleger, getAllePfleger } from "../../src/services/PflegerService";
import { Pfleger } from "../../src/model/PflegerModel";
import { createProtokoll } from "../../src/services/ProtokollService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


let idBehrens: string
let idProtokoll: string
let pwBehrens = "G€h4im"
let nameBehrens = "Hofrat Behrens"

beforeEach(async () => {
    const behrens = await createPfleger({ name: nameBehrens, password: pwBehrens, admin: true })
    idBehrens = behrens.id!;
    const protokoll = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    idProtokoll = protokoll.id!;
})

test("/api/pfleger/alle get Pfleger", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const get = await testee.get(`/api/pfleger/alle`);
    expect(get.statusCode).toBe(200);
    expect(get.body[0].name).toBe("Hofrat Behrens");
})

test("/api/pfleger/alle get empty DB", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);    
    await Pfleger.deleteMany().exec()
    const get = await testee.get(`/api/pfleger/alle`);
    expect(get.statusCode).toBe(200);
    expect(get.body.length).toBe(0);
})

test("/api/pfleger/:id delete Pfleger",  async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const max = await createPfleger({name: "Max", password: "Mät?ch3n", admin: false})
    const del = await testee.delete(`/api/pfleger/${max.id!}`);

    expect(del.statusCode).toBe(204);
})

test("/api/pfleger/:id delete non-existent Pfleger",  async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const max = await createPfleger({name: "Max", password: "Mät?ch3n", admin: false})

    await Pfleger.deleteMany().exec();
    const del = await testee.delete(`/api/pfleger/${max.id!}`);

    expect(del.statusCode).toBe(404);
})

test("/api/pfleger create a new Pfleger", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const post = await testee.post(("/api/pfleger")).send({"name": "Peter","admin": false, "password": "1234*%&abGE"})

    expect(post.statusCode).toBe(201);
})

test("/api/pfleger create a new Pfleger, name missing", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const post = await testee.post(("/api/pfleger")).send({"password": "1234"})

    expect(post.statusCode).toBe(400);
})

test("/api/pfleger PUT update a Pfleger", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const put = await testee.put(`/api/pfleger/${idBehrens}`).send({"id":idBehrens, "name": "Hoffi Behrens", "admin": false});

    expect(put.statusCode).toBe(200)
    expect(put.body.name).toBe("Hoffi Behrens")
})

test("/api/pfleger PUT update ID not the same", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const put = await testee.put(`/api/pfleger/${idProtokoll}`).send({"id":idBehrens, "name": "Hoffi Behrens"});

    expect(put.statusCode).toBe(400)
})

test("/api/pfleger PUT update ID not valid", async () => {
    await performAuthentication(nameBehrens, pwBehrens)
    const testee = supertestWithAuth(app);
    const put = await testee.put(`/api/pfleger/${idProtokoll}`).send({"id":idProtokoll, "name": "Hoffi Behrens", "admin": false});

    expect(put.statusCode).toBe(404)
})

test("/api/pfleger/alle PUT should return 404", async () => {
    const testee = supertest(app);
    const put = await testee.put(`/api/pfleger/alle`).send({
        name: "Hoffi Berentzen", password: "geheim", admin: false
    });
    expect(put.statusCode).toBe(404);
})

// don't know if above or below is what is meant

test("/api/pfleger/alle PUT should return 404", async () => {
    const testee = supertest(app);
    const put = await testee.put(`/api/pfleger/alle`).send([{
        name: "Hoffi Berentzen", password: "geheim", admin: false
    }, {
        name: "Baba Ghanoush", password: "geheim", admin: false
    }]);
    expect(put.statusCode).toBe(404);
})