import { Types, Document } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../../src/services/PflegerService";
import bcrypt from "bcryptjs"; 

let pfleger1: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let pfleger2: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let pfleger3: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };

let pfleger4 = new Pfleger({name: "Paul", password: "password"})
let res = {id: pfleger4.id, name: pfleger4.name, password: pfleger4.password, admin: pfleger4.admin!};

beforeEach(async () => {
    pfleger1 = await new Pfleger({name: "Max", password: "1234"}).save()
    pfleger2 = await new Pfleger({name: "Maik", password: "4321"}).save()
    pfleger3 = await new Pfleger({name: "Malik", password: "qwe"}).save()
})

afterEach(async () =>{
    await Pfleger.deleteMany().exec()
})

test("getAllePfleger Test 1", async () => {
    const get = await getAllePfleger();
    expect(get[0].name).toBe("Max")
    expect(get[1].name).toBe("Maik")
    expect(get[2].name).toBe("Malik")
})

test("getAllePfleger Test 2", async () => {
    const get = await getAllePfleger();
    expect(get[0].password).not.toBeDefined()
    expect(get[1].password).not.toBeDefined()
    expect(get[2].password).not.toBeDefined()
})

test("getAllePfleger Test 3", async () => {
    const get = await getAllePfleger();
    expect(get[0].id).toBe(pfleger1.id)
    expect(get[1].id).toBe(pfleger2.id)
    expect(get[2].id).toBe(pfleger3.id)
})

test("createPfleger Test 1", async () => {
    expect(async () => await createPfleger(res)).not.toThrowError()
    const find = await Pfleger.findOne({name: "Paul"}).exec()
    expect(find).toBeDefined()
})

test("createPfleger Test 2", async () => {
    await Pfleger.deleteOne({name: "Paul"}).exec()
    await createPfleger(res);
    const find = await Pfleger.findOne({name: "Paul"}).exec()
    expect(find).toBeDefined()
    const isCorrectPW = await bcrypt.compare("password", find!.password)
    expect(isCorrectPW).toBe(true)
})

test("updatePfleger Test 1", async () => {
    let pfleger5 = new Pfleger({name: "Uwe", password: "lelek"})
    let res5 = {name: pfleger5.name, password: "1234", admin: false}
    let create = await createPfleger(res5);

    const find = await Pfleger.findOne({name: "Uwe"}).exec()
    const isCorrectPW = await bcrypt.compare("1234", find!.password)
    expect(isCorrectPW).toBe(true)
    
    let res5Update = {id: create.id, name: pfleger5.name, password: "4321", admin: false}
    await updatePfleger(res5Update);
    const findUpdate = await Pfleger.findOne({name: "Uwe"}).exec()
    
    const isUpdatePW = await bcrypt.compare("4321", findUpdate!.password)
    expect(isUpdatePW).toBe(true)

})

test("updatePfleger Test 2", async () => {
    let pfleger5 = new Pfleger({name: "Uwe", password: "lelek"})
    let res5 = {name: pfleger5.name, password: pfleger5.password, admin: false}
    let create = await createPfleger(res5);
    
    let res5Update = {id: create.id, name: "Ulrich", admin: false}
    await updatePfleger(res5Update);
    const findUpdate = await Pfleger.findOne({name: "Ulrich"}).exec()
    
    const isUpdatePW = await bcrypt.compare("lelek", findUpdate!.password)
    expect(isUpdatePW).toBe(true)

})


test("updatePfleger Test 3", async () => {
    let pfleger5 = new Pfleger({name: "Uwe", password: "lelek"})
    let res5 = { name: pfleger5.name, password: pfleger5.password, admin: false}
    await createPfleger(res5);
    
    let res5Update = {id: "1234", name: "Ulrich", admin: false}
    expect(async () => await updatePfleger(res5Update)).rejects.toThrowError();
})

test("updatePfleger Test 4", async () => {
    let res5Update = {name: "Ulrich", admin: false}
    expect(async () => await updatePfleger(res5Update)).rejects.toThrowError();
})

test("deletePfleger Test 1", async () => {
    await deletePfleger(pfleger1.id);
    const search = await Pfleger.findOne({name: "Max"}).exec()
    expect(search).toBeNull()
})

test("deletePfleger Test 2", async () => {
    expect(async () => 
    await deletePfleger(pfleger4.id)).rejects.toThrow("Couldn't find Pfleger with id: "+pfleger4.id)
})

test("updatePfleger test no ID", async () => {
    expect(async () => await updatePfleger({name: "Malik", password: "qwe", admin: false})).rejects.toThrow("Please provide an ID to update!")
})