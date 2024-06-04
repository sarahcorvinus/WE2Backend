import { Types, Document } from "mongoose";
import { login } from "../../src/services/AuthenticationService";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";

let admin: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
let user: Document<unknown, {}, IPfleger> & IPfleger & { _id: Types.ObjectId; };
beforeEach(async () => {
     admin = await new Pfleger({name: "Baba", password: "admin", admin: true}).save();
     user = await new Pfleger({name: "Bimbo", password: "user"}).save();
})

afterEach(async () => {
    await Pfleger.deleteMany().exec();
})

test("login admin correct pw", async () => {
    const role = await login(admin.name,  "admin");
    expect(role).toStrictEqual({id: admin.id, role: "a"})
})

test("login admin wrong pw", async () => {
    const role = await login(admin.name,  "kp");
    expect(role).toBe(false)
})

test("login user correct pw", async () => {
    const role = await login(user.name,  "user");
    expect(role).toStrictEqual({id: user.id, role: "u"})
})

test("login user wrong pw", async () => {
    const role = await login(user.name,  "kp");
    expect(role).toBe(false)
})

test("login non-existing user", async () => {
    const role = await login("gibtsnicht",  "kp");
    expect(role).toBe(false)
})
