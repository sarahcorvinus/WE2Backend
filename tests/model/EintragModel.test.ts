import { Document, Types } from "mongoose";
import {Eintrag} from "../../src/model/EintragModel"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel"
let pfleger: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let prot1: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };
beforeEach(async ()=>{
    pfleger = new Pfleger({name: "Max", password: "1234"})
    await pfleger.save()
    prot1 = new Protokoll({ersteller: pfleger._id, patient: "Gudrun", datum: new Date})
    await prot1.save()
})

afterEach(async () => {
    await Pfleger.deleteMany().exec()
    await Protokoll.deleteMany().exec()
})

test("Eintrag Test", async () => {
    const entry1 = new Eintrag({ersteller: pfleger._id, protokoll: prot1.id, getraenk: "Wasser", menge: 200})
    await entry1.save()

    const retrieve = await Eintrag.findOne({ersteller: pfleger.id}).exec()
    expect(retrieve!.protokoll).toEqual(prot1._id)

    await Protokoll.deleteOne({ersteller: pfleger._id}).exec()

    const ret2 = await Eintrag.findOne({ersteller: pfleger._id}).exec()
    expect(ret2?.ersteller).toEqual(pfleger._id)
})

