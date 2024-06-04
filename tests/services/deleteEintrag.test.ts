import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { deleteEintrag } from "../../src/services/EintragService";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { stringToDate } from "../../src/services/ServiceHelper";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";

let entryID: number;

let pfleger: HydratedDocument<IPfleger>;
let prot: HydratedDocument<IProtokoll>;
let entry: HydratedDocument<IEintrag>;
let entry2: HydratedDocument<IEintrag>;
beforeEach(async () => {
    pfleger = await new Pfleger({name: "Max", password: "1234"}).save()
    prot = await new Protokoll({patient: "Gudrun", datum: stringToDate("2023-11-05"), ersteller: pfleger.id,}).save()
    entry = await new Eintrag({getraenk: "Wasser", menge: 200, ersteller: pfleger.id, protokoll: prot.id}).save()
    entry2 = await new Eintrag({getraenk: "Milch", menge: 200, ersteller: pfleger.id, protokoll: prot.id}).save()
})

afterEach(async () => {
    await Eintrag.deleteMany({}).exec()
    await Protokoll.deleteMany({}).exec()
    await Pfleger.deleteMany({}).exec()
})

test("deleteEintrag Test 1", async () => {
    await deleteEintrag(entry.id)
    const find = await Eintrag.findById(entry.id).exec()

    expect(find).toBeNull()
})

test("deleteEintrag Test 2", async () => {
    const findEntry = await Eintrag.findOne().exec()
    await Eintrag.deleteMany({}).exec()
    
    expect(async () => await deleteEintrag(findEntry!.id)).rejects.toThrowError()
})

test("deleteEintrag Test 3", async () => {
    // @ts-ignore
    expect(async () => await deleteEintrag(null)).rejects.toThrowError("Please provide an ID.")
})

test("deleteEintrag Test 4", async () => {
    await deleteEintrag(entry.id)
    const find = await Eintrag.findById(entry2.id).exec()

    expect(find).not.toBeNull()
})