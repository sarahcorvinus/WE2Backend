import { Document, Types } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel"
import {createProtokoll, deleteProtokoll, getProtokoll, updateProtokoll} from "../../src/services/ProtokollService"
import { dateToString, stringToDate } from "../../src/services/ServiceHelper";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";

let prot1: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };
let pfleger1: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let protRes: { id: string; patient: string; datum: string; ersteller: string; public?: boolean | undefined; closed?: boolean | undefined; erstellerName?: string | undefined; updatedAt?: string | undefined; gesamtMenge?: number | undefined; };
let protResUpdate: { id: string; patient: string; datum: string; ersteller: string; public?: boolean | undefined; closed?: boolean | undefined; erstellerName?: string | undefined; updatedAt?: string | undefined; gesamtMenge?: number | undefined; };
let protResFakeId: { id: string; patient: string; datum: string; ersteller: string; public?: boolean | undefined; closed?: boolean | undefined; erstellerName?: string | undefined; updatedAt?: string | undefined; gesamtMenge?: number | undefined; };
let protResNoId: { patient: string; datum: string; ersteller: string; public?: boolean | undefined; closed?: boolean | undefined; erstellerName?: string | undefined; updatedAt?: string | undefined; gesamtMenge?: number | undefined; };
let protResNoPatient: { datum: string; ersteller: string; public?: boolean | undefined; closed?: boolean | undefined; erstellerName?: string | undefined; updatedAt?: string | undefined; gesamtMenge?: number | undefined; };
let entry1:  Document<unknown, {}, IEintrag> & IEintrag & { _id: Types.ObjectId; };
let entry2:  Document<unknown, {}, IEintrag> & IEintrag & { _id: Types.ObjectId; };

beforeEach(async () => {
    pfleger1 = await new Pfleger({ name: "Peter", password: "1234" }).save();
    prot1 = await new Protokoll({patient: "Gudrun", datum: stringToDate("2023-11-05"), ersteller: pfleger1.id}).save();
    protRes = {id: prot1.id, patient: prot1.patient, datum: dateToString(prot1.datum), ersteller: pfleger1.id};
    protResUpdate = {id: prot1.id, patient: "Gerlinde", datum: dateToString(prot1.datum), ersteller: pfleger1.id, closed: false, public: false};
    protResFakeId = {id: "1", patient: prot1.patient, datum: dateToString(prot1.datum), ersteller: pfleger1.id};
    protResNoId = { patient: prot1.patient, datum: dateToString(prot1.datum), ersteller: pfleger1.id};
    protResNoPatient = { datum: dateToString(prot1.datum), ersteller: pfleger1.id};

    entry1 = await Eintrag.create({getraenk: "Milch", menge: 300, ersteller: pfleger1.id, protokoll: prot1});
    entry2 = await Eintrag.create({getraenk: "Wasser", menge: 250, ersteller: pfleger1.id, protokoll: prot1});
})
let pfleger2 = new Pfleger({name: "Matze", password: "qwertz"})
let prot2 = new Protokoll({patient: "Gudrun", datum: stringToDate("2023-11-05"), ersteller: pfleger2.id})

afterEach(async () => {
    await Pfleger.deleteMany().exec()
    await Protokoll.deleteMany().exec()
})

test("getProtokoll Test 1", async () => {
    const get = await getProtokoll(prot1.id)
    expect(get.erstellerName).toBe("Peter")
    expect(get.patient).toBe("Gudrun")
})

test("getProtokoll Test 2", async () => {
    const id = String(new Types.ObjectId(1))
    expect(async () => await getProtokoll(id)).rejects.toThrow("No Protokoll matching the provided ID could be found!")
})

test("createProtokoll Test 1", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    const create = await createProtokoll(protRes)
    expect(create.patient).toBe("Gudrun")
})

test("createProtokoll Test 2", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    const create = await createProtokoll(protRes)
    const find = await Protokoll.findOne({patient: "Gudrun"}).exec()
    expect(find!.patient).toBe("Gudrun")
})

test("createProtokoll Test 3", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    const create = await createProtokoll(protResNoId)
    const find = await Protokoll.findOne({patient: "Gudrun"}).exec()
    expect(find!.patient).toBe("Gudrun")
})

test("createProtokoll Test 4", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    // @ts-ignore
    expect(async () => await createProtokoll(protResNoPatient)).rejects.toThrowError()
})

test("createProtokoll Test 5", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    const create = await createProtokoll(protResNoId)
    expect(create.erstellerName).toBe("Peter")
})

test("createProtokoll Test 6", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    expect(async () => await createProtokoll(protResFakeId)).rejects.toThrow("Seems there is no Pfleger with that id!")
})


test("updateProtokoll Test 1", async () => {
    await Protokoll.findOne({patient: "Gudrun"}).exec()
    await updateProtokoll(protResUpdate)
    
    const find = await Protokoll.find({patient: "Gerlinde"}).exec()
    expect(find.length).toBe(1)
})

test("updateProtokoll Test 2", async () => {
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()
    expect(async () => await updateProtokoll(protResUpdate)).rejects.toThrowError()
})

test("deleteProtokoll Test 1", async () => {
    await deleteProtokoll(prot1.id)
    const find = await Protokoll.findById(prot1.id).exec()
    expect(find).toBe(null)
})

test("deleteProtokoll Test 2", async () => {
    expect(async () => 
    await deleteProtokoll(prot2.id)).rejects.toThrow("Couldn't find Protokoll with id: "+prot2.id)
})

test("create Error",async () => {
    expect(async()=> await createProtokoll({patient: "Gudrun", datum: dateToString(stringToDate("2023-11-05")), ersteller: pfleger1.id}))
            .rejects.toThrow("There is already a Protokoll for that date for patient Gudrun")
})

test("getProtokoll Menge", async () => {
    const get = await getProtokoll(prot1.id);
    expect(get.gesamtMenge).toBe(550)
})