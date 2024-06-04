import { Types, Document } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { updateProtokoll } from "../../src/services/ProtokollService";
import { dateToString, stringToDate } from "../../src/services/ServiceHelper";

/* let prot1: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };
let pfleger1: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
 */

let pfleger: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let prot: Document<unknown, {}, IProtokoll> & IProtokoll & { _id: Types.ObjectId; };
let protRes: { id: string; patient: string; datum: string; ersteller: string; public?: boolean | undefined; closed?: boolean | undefined; erstellerName?: string | undefined; updatedAt?: string | undefined; gesamtMenge?: number | undefined; };
// let date = dateToString(new Date)
let date = stringToDate("2023-11-05")

beforeEach(async () => {
    pfleger =  new Pfleger({name: "Max", password: "1234"})
    prot =  new Protokoll({patient: "Gudrun", datum: date, ersteller: pfleger.id})
    
})

afterEach(async () => {
    await Pfleger.deleteMany({}).exec()
    await Protokoll.deleteMany({}).exec()
})

test("update Error", async () => {
    await pfleger.save()
    await prot.save()
    const find = await Protokoll.findOne({patient: "Gudrun"}).exec()
    protRes = {id: find!.id, patient: "Gudrun", ersteller: pfleger.id.toString(), datum: dateToString(date)}
    expect(async () => {
        await updateProtokoll(protRes)}).rejects.toThrow("There is already a Protokoll for that date for patient Gudrun")
})

