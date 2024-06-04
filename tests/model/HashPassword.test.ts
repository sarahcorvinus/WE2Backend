import { Document, Types } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import bcrypt from "bcryptjs"

let pf1: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
beforeEach(async ()=>{
    pf1 = new Pfleger({name: "Max", password: "1234"})
    await pf1.save()
})

afterEach(async ()=>{
    await Pfleger.deleteMany();
})


test("Test Hash pre-hook 'save'", async () => {
    const isSame = await bcrypt.compare("1234", pf1.password);
    expect(isSame).toBe(true);
})

test("Test hashing pre hook updateOne", async () => {
  await Pfleger.updateOne({name: "Max"}, {password: "4321"}).exec()
  const find = await Pfleger.findOne({name: "Max"}).exec()
  const isSame = await bcrypt.compare("4321", find!.password)
  expect(isSame).toBe(true)
})

test("Test isCorrectPassword()", async () => {
    const find = await Pfleger.findOne({name: "Max"}).exec()
    const isCorrect = await find!.isCorrectPassword("1234")
    expect(isCorrect).toBe(true)
})

test("Test isCorrectPassword() 2", async () => {
    const find = await Pfleger.findOne({name: "Max"}).exec()
    const isCorrect = await find!.isCorrectPassword("666")
    expect(isCorrect).toBe(false)
})

test("isCorrectPassword Error",async () => {
    const pf2 = new Pfleger({name: "Maik", password: "qwertz"})
    await pf2.save()
    pf2.password = "fakePW"
    expect(async () => {
        await pf2.isCorrectPassword("qwertz")
    }).rejects.toThrowError()
})

test("isCorrectPassword Error 2",async () => {
    const pf2 = new Pfleger({name: "Maik", password: "qwertz"})
    await pf2.save()
    expect(async () => {
        await pf2.isCorrectPassword("qwertz")
    }).not.toThrowError()
})