import { Types, Document } from "mongoose";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { createEintrag, getEintrag, updateEintrag } from "../../src/services/EintragService";
import { dateToString, stringToDate } from "../../src/services/ServiceHelper";
import { EintragResource } from "../../src/Resources";

let prot: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };
let fakeProt: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };
let pfleger: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let fakePfleger: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let eintrag: Document<unknown, {}, IEintrag> & IEintrag & { _id: Types.ObjectId; };
let protClosed: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };

let entryRes: EintragResource;
let entryResClosed: EintragResource;
let entryResFakeProt: EintragResource;
let entryResFakePfleger: EintragResource;
let entryResUpdate: EintragResource;
let fakeProtId: string;
let fakePflegerId: string;
let closedId: string;

beforeEach(async () => {
    pfleger = await new Pfleger({name: "Max", password: "1234"}).save()
    prot = await new Protokoll({patient: "Gudrun", ersteller: pfleger.id.toString(), datum: stringToDate("2023-11-05")}).save()
    eintrag = await new Eintrag({getraenk: "Wasser", menge: 200, ersteller: pfleger.id.toString(), protokoll: prot.id.toString()}).save()
    
    entryRes = {id: eintrag.id, getraenk: "Milch", menge: 150, ersteller: pfleger.id, protokoll: prot.id}
    fakeProt = await new Protokoll({patient: "Gerlinde", ersteller: pfleger.id.toString(), datum: stringToDate("2023-11-05")}).save()
    fakeProtId = fakeProt.id;
    await Protokoll.deleteOne({patient: "Gerlinde"}).exec()
    entryResFakeProt = {id: eintrag.id, getraenk: "Milch", menge: 150, ersteller: pfleger.id, protokoll: fakeProtId}
    
    fakePfleger = await Pfleger.create({name: "Peter", password: "1234"})
    fakePflegerId = fakePfleger.id;
    await Pfleger.deleteOne({name: "Peter"}).exec()
    entryResFakePfleger = {getraenk: "Bourbon", menge: 50, ersteller: fakePflegerId, protokoll: prot.id}
    
    protClosed = await Protokoll.create({ersteller: pfleger.id, patient: "Martina", datum: dateToString(new Date("2023-11-05")), closed: true})
    closedId = protClosed.id;
    entryResClosed = {getraenk: "Gin", menge: 200, ersteller: pfleger.id, protokoll: protClosed.id}
    
    entryResUpdate = {id: eintrag.id, getraenk: "Milch", menge: 150, ersteller: pfleger.id, protokoll: prot.id}
})

afterEach(async () => {
    await Eintrag.deleteMany({}).exec()
    await Protokoll.deleteMany({}).exec()
    await Pfleger.deleteMany({}).exec()
})

test("getEintrag Test 1", async () => {
    const findProt = await Eintrag.findOne({getraenk: "Wasser"}).exec()
    const get = await getEintrag(findProt!.id)
    expect(get.menge).toBe(200)
})

test("getEintrag Test 2", async () => {
    const findProt = await Eintrag.findOne({getraenk: "Wasser"}).exec()
    const get = await getEintrag(findProt!.id)
    expect(get.ersteller).toBe(pfleger.id)
})

test("getEintrag Test 3", async () => {
    const findProt = await Eintrag.findOne({getraenk: "Wasser"}).exec()
    const get = await getEintrag(findProt!.id)
    expect(get.protokoll).toBe(prot.id)
})

test("getEintrag Test 4", async () => {
    const findProt = await Eintrag.findOne({getraenk: "Wasser"}).exec()
    const id = findProt!.id;
    await Eintrag.deleteMany().exec()
    expect(async () => await getEintrag(findProt!.id)).rejects.toThrow("Couldn't find Eintrag with id: " + id)
})

test("createEintrag Test 1", async () => {
    await createEintrag(entryRes);
    const find = await Eintrag.findOne({protokoll: prot.id, getraenk: "Milch"}).exec()
    expect(find!.menge).toBe(150)
})

test("createEintrag Test 2", async () => {
    expect(async () => await createEintrag(entryResFakeProt)).rejects.toThrow("No protokoll found with id "+fakeProtId);
})

test("createEintrag Test 3", async () => {
    expect(async () => await createEintrag(entryResFakePfleger)).rejects.toThrow("No pfleger found with id "+fakePflegerId);
})

test("createEintrag Test 4", async () => {
    expect(async () => await createEintrag(entryResClosed)).rejects.toThrow(`Protokoll ${closedId} is already closed`);
})

test("updateEintrag Test 1", async () => {
    const update = await updateEintrag(entryResUpdate)
    expect(update.getraenk).toBe("Milch")

    const get = await getEintrag(eintrag.id)
    expect(get.getraenk).toBe("Milch")
})

test("updateEintrag Test 2", async () => {
    // @ts-ignore
    expect(async() => await updateEintrag()).rejects.toThrowError()
})

test("updateEintrag Test 3", async () => {
    expect(async() => await updateEintrag(
        {id: null!, getraenk: "Milch", menge: 50, ersteller: pfleger.id, protokoll: prot.id}
        )).rejects.toThrow("Please provide an id to search for.")
})

test("updateEintrag Test 4", async () => {
    const entry = await Eintrag.create({ersteller: pfleger.id, getraenk: "Apfelsaft", protokoll: prot.id, menge: 200})
    const find = await Eintrag.findOne({getraenk: "Apfelsaft"}).exec()
    const id = find!.id
    await Eintrag.deleteMany({}).exec()
    await expect(async() => await updateEintrag(
        {id: id.toString(), getraenk: "Milch", menge: 50, ersteller: pfleger.id, protokoll: prot.id}
        )).rejects.toThrow("Couldn't find Eintrag with id: "+id)
    })
    
test("updateEintrag Test 5", async () => {
    const comment = "Hat sich geweigert zu trinken.";
    const entry: EintragResource = {id: eintrag.id, ersteller: pfleger.id, getraenk: "Orangensaft", protokoll: prot.id, menge: 200, kommentar: comment}
    await updateEintrag(entry)

    const find = await Eintrag.findOne({getraenk: "Orangensaft"}).exec()
    expect(find?.kommentar).toBe(comment)
})
