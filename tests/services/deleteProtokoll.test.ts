import { HydratedDocument } from "mongoose";
import { deleteProtokoll } from "../../src/services/ProtokollService";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { stringToDate } from "../../src/services/ServiceHelper";

let pfleger: HydratedDocument<IPfleger>;

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
    prot1 = await Protokoll.create({patient: "Gudrun", datum: stringToDate("2023-11-05"), ersteller: pfleger.id})
    prot2 = await Protokoll.create({patient: "Gerlinde", datum: stringToDate("2023-11-05"), ersteller: pfleger.id})

    entry1 = await Eintrag.create({getraenk: "Milch", menge: 200, ersteller: pfleger.id, protokoll: prot1.id})
    entry2 = await Eintrag.create({getraenk: "Wodka", menge: 50, ersteller: pfleger.id, protokoll: prot1.id})

    entry3 = await Eintrag.create({getraenk: "Kaffee", menge: 200, ersteller: pfleger.id, protokoll: prot2.id})
    entry4 = await Eintrag.create({getraenk: "Tee", menge: 50, ersteller: pfleger.id, protokoll: prot2.id})
})


test("deleteProtokoll deletes Eintraege belonging to Protokoll", async () => {
    await deleteProtokoll(prot1.id)

    const del1 = await Eintrag.findById(entry1.id).exec()
    expect(del1).toBeNull()
    
    const del2 = await Eintrag.findById(entry2.id).exec()
    expect(del2).toBeNull()

})

test("deleteProtokoll doesn't delete Eintraege not belonging to Protokoll", async () => {
    await deleteProtokoll(prot1.id)

    const left1 = await Eintrag.findById(entry3.id).exec()
    expect(left1?.getraenk).toBe("Kaffee")
    
    const left2 = await Eintrag.findById(entry4.id).exec()
    expect(left2?.getraenk).toBe("Tee")
})