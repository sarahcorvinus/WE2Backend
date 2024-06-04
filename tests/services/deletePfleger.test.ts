import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { stringToDate } from "../../src/services/ServiceHelper";
import { deletePfleger } from "../../src/services/PflegerService";

let pfleger: HydratedDocument<IPfleger>;
let pfleger2: HydratedDocument<IPfleger>;

let prot1: HydratedDocument<IProtokoll>;
let prot2: HydratedDocument<IProtokoll>;

let entry1: HydratedDocument<IEintrag>;
let entry2: HydratedDocument<IEintrag>;
let entry3: HydratedDocument<IEintrag>;
let entry4: HydratedDocument<IEintrag>;

afterEach(async () => {
    await Pfleger.deleteMany().exec()
    await Protokoll.deleteMany().exec()
    await Eintrag.deleteMany().exec()
})

beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Max", password: "1234"})
    pfleger2 = await Pfleger.create({name: "Paul", password: "1234"})
    prot1 = await Protokoll.create({patient: "Gudrun", datum: stringToDate("2023-11-05"), ersteller: pfleger.id})
    prot2 = await Protokoll.create({patient: "Gerlinde", datum: stringToDate("2023-11-05"), ersteller: pfleger2.id})

    entry1 = await Eintrag.create({getraenk: "Milch", menge: 200, ersteller: pfleger.id, protokoll: prot1.id})
    entry2 = await Eintrag.create({getraenk: "Wodka", menge: 50, ersteller: pfleger2.id, protokoll: prot1.id})

    entry3 = await Eintrag.create({getraenk: "Kaffee", menge: 200, ersteller: pfleger.id, protokoll: prot2.id})
    entry4 = await Eintrag.create({getraenk: "Tee", menge: 50, ersteller: pfleger2.id, protokoll: prot2.id})
})

test("deletePfleger deletes Protokolle belonging to Pfleger", async () => {
    await deletePfleger(pfleger.id)
    const findPfleger = await Pfleger.findById(pfleger.id).exec()
    expect(findPfleger).toBeFalsy()

    const findProt1 = await Protokoll.findById(prot1.id).exec()
    expect(findProt1).toBeFalsy()
    
    // doesn't delete Protokoll not belonging to him
    const findProt2 = await Protokoll.findById(prot2.id).exec()
    expect(findProt2).toBeTruthy()
})

test("deletePfleger deletes Eintraege belonging to Pfleger", async () => {
    await deletePfleger(pfleger.id)
    const findPfleger = await Pfleger.findById(pfleger.id).exec()
    expect(findPfleger).toBeFalsy()

    const findEntry1 = await Eintrag.findById(entry1.id).exec()
    expect(findEntry1).toBeFalsy()

    const findEntry3 = await Eintrag.findById(entry3.id).exec()
    expect(findEntry3).toBeFalsy()
})

test("deletePfleger deletes Eintraege belonging to Protokoll belonging to Pfleger", async () => {
    await deletePfleger(pfleger.id)
    const findPfleger = await Pfleger.findById(pfleger.id).exec()
    expect(findPfleger).toBeFalsy()

    const findEntry2 = await Eintrag.findById(entry2.id).exec()
    expect(findEntry2).toBeFalsy()

    const findAll = await Eintrag.find().exec()
    expect(findAll.length).toBe(1)
})