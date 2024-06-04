import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { getAlleProtokolle } from "../../src/services/ProtokollService";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";

let pfleger: HydratedDocument<IPfleger>;
let pfleger2: HydratedDocument<IPfleger>;
let prot1: HydratedDocument<IProtokoll>;
let prot2: HydratedDocument<IProtokoll>;
let prot3: HydratedDocument<IProtokoll>;
let prot4: HydratedDocument<IProtokoll>;

let eintrag1: HydratedDocument<IEintrag>;
let eintrag2: HydratedDocument<IEintrag>;

beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Peter", password: "1234"})
    pfleger2 = await Pfleger.create({name: "Paul", password: "1234"})
    prot1 = await Protokoll.create({patient: "Gudrun", ersteller: pfleger.id, datum: new Date})
    prot2 = await Protokoll.create({patient: "Gerlinde", ersteller: pfleger.id, datum: new Date})
    prot3 = await Protokoll.create({patient: "Mathilde", ersteller: pfleger2.id, datum: new Date, public: true})
    prot4 = await Protokoll.create({patient: "Werner", ersteller: pfleger2.id, datum: new Date, public: true})

    eintrag1 = await Eintrag.create({getraenk: "Wasser", ersteller: pfleger.id, protokoll: prot1.id, menge: 200})
    eintrag2 = await Eintrag.create({getraenk: "Milch", ersteller: pfleger.id, protokoll: prot1.id, menge: 200})
})

afterEach(async () => {
    await Pfleger.deleteMany().exec()
    await Protokoll.deleteMany().exec()
    await Eintrag.deleteMany().exec()
})

test("getAlleProtokolle Test 1",async () => {
    const prots = await getAlleProtokolle(pfleger!.id)
    expect(prots.length).toBe(4)
})

test("getAlleProtokolle Test 2",async () => {
    const prots = await getAlleProtokolle(pfleger2!.id)
    expect(prots.length).toBe(2)
})

test("getAlleProtokolle Test 3",async () => {
    const prots = await getAlleProtokolle()
    expect(prots.length).toBe(2)
})

test("getAlleProtokolle Test Erstellername", async () => {
    const prots = await getAlleProtokolle(pfleger.id)
    expect(prots[2].erstellerName).toBe("Peter")
})

test("getAlleProtokolle Test Gesamtmenge", async () => {
    const prots = await getAlleProtokolle(pfleger.id)
    expect(prots[2].gesamtMenge).toBe(400)
})