import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { getAlleEintraege } from "../../src/services/EintragService";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";

let pfleger: HydratedDocument<IPfleger>;
let pfleger2: HydratedDocument<IPfleger>;
let prot1: HydratedDocument<IProtokoll>;
let prot2: HydratedDocument<IProtokoll>;

let entry1: HydratedDocument<IEintrag>;
let entry2: HydratedDocument<IEintrag>;
let entry3: HydratedDocument<IEintrag>;
let entry4: HydratedDocument<IEintrag>;

beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Peter", password: "1234"})
    pfleger2 = await Pfleger.create({name: "Paul", password: "1234"})
    prot1 = await Protokoll.create({patient: "Gudrun", ersteller: pfleger.id, datum: new Date})
    prot2 = await Protokoll.create({patient: "Gerlinde", ersteller: pfleger.id, datum: new Date})

    entry1 = await Eintrag.create({getraenk: "Milch", ersteller: pfleger.id, menge: 200, protokoll: prot1.id})
    entry2 = await Eintrag.create({getraenk: "Wasser", ersteller: pfleger.id, menge: 150, protokoll: prot1.id})
    
    entry3 = await Eintrag.create({getraenk: "Orangensaft", ersteller: pfleger2.id, menge: 200, protokoll: prot2.id})
    entry4 = await Eintrag.create({getraenk: "Kaffee", ersteller: pfleger.id, menge: 150, protokoll: prot2.id, kommentar: "kp"})
})

afterEach(async () => {
    await Pfleger.deleteMany().exec()
    await Protokoll.deleteMany().exec()
    await Eintrag.deleteMany().exec()
})

test("getAlleEintraege Test 1", async () => {
    const get = await getAlleEintraege(prot1.id)
    expect(get.length).toBe(2)
})

test("getAlleEintraege Test 2", async () => {
    const get = await getAlleEintraege(prot1.id)
    expect(get[0].getraenk).toBe("Milch")
})

test("getAlleEintraege Test 3", async () => {
    const get = await getAlleEintraege(prot1.id)
    expect(get[0].ersteller).toBe(pfleger.id)
})

test("getAlleEintraege Test 4", async () => {
    const get = await getAlleEintraege(prot2.id)
    expect(get[0].erstellerName).toBe(pfleger2.name)
})

test("getAlleEintraege Test 5", async () => {
    const get = await getAlleEintraege(prot2.id)
    expect(get[1].kommentar).toBe("kp")
})

test("getAlleEintraege Test 6", async () => {
    const id = await Eintrag.findOne({getraenk: "Wasser"}).exec().then((res)=>res!.id)
    await Eintrag.deleteMany().exec()

    expect(async () => await getAlleEintraege(id)).rejects.toThrow("Couldn't find Protokoll with id "+id)
})

