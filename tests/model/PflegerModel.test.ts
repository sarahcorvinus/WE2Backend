import { Pfleger } from "../../src/model/PflegerModel";

test("new Pfleger 'Erika'", async () => {
    const pfleger = new Pfleger({name: "Erika", password: "1234"})
    const res = await pfleger.save();
    expect(res).toBeDefined();
    expect(res.name).toBe("Erika");
    expect(res.password).not.toBe("1234");
})


test("updateOne und findOne",async () => {
    const pfleger = new Pfleger({name: "Erika", password: "1234"})
    await pfleger.save();

    const update = await Pfleger.updateOne({name: "Erika"}, {name: "Erigar", password: "4321"}).exec();
    expect(update.matchedCount).toBe(1);
    expect(update.modifiedCount).toBe(1);
    expect(update.acknowledged).toBe(true);

    const find = await Pfleger.findOne({name: "Erika"}).exec();
    
    if(find) {
        console.log("Error! Found val that should have been updated!");
    } 
    
    const find2 = await Pfleger.findOne({name: "Erigar"}).exec();

    if(!find2) {
        throw new Error("Error! Didn't find updated value!")
    }
    expect(find2!.name).toBe("Erigar")
})




