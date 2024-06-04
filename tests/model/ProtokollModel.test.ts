import { Types } from "mongoose";
import { Pfleger } from "../../src/model/PflegerModel";
import { Protokoll } from "../../src/model/ProtokollModel";


test("Test Konstruktor ID & date", async () => {
    const pfleger = new Pfleger({ name: "Max", password: "1234" });
    await pfleger.save();
  
    const id = pfleger._id;
    const start = new Date
    const prot1 = new Protokoll({ersteller: id, patient: "Gudrun", datum: new Date()});
    const end = await prot1.save().then(()=> new Date); 

    const retrieve = await Protokoll.findOne({ patient: "Gudrun" }).exec(); 
    
    if(retrieve!.datum<start || retrieve!.datum>end) {
        throw new Error("datum is wrong")
    }
    expect(retrieve!.ersteller).toEqual(id); 
  });


  test("Test Konstruktor invalid ID", async () => {
    const id = 123456;
    const prot1 = new Protokoll({ersteller: id, patient: "Gudrun", datum: new Date()})
    try {
        await prot1.save() 
    } catch (error) {
        console.log("id invalid: " + error)
    }
    const retrieve = await Protokoll.findOne({patient: "Gudrun"}).exec()
    expect(()=>retrieve!.ersteller).toThrowError()
})

test("Test Konstruktor forced invalid ID", async () => {
    const id = new Types.ObjectId(123456);
    const prot1 = new Protokoll({ersteller: id, patient: "Gudrun", datum: new Date()})
   
    await prot1.save() 
   
    const retrieve = await Protokoll.findOne({patient: "Gudrun"}).exec()
    expect(()=>retrieve!.ersteller).not.toThrowError()
    expect(retrieve!.ersteller).toEqual(id)
})

test("updatedAt Test", async () => {
    const pfleger = new Pfleger({ name: "Max", password: "1234" });
    await pfleger.save();
    
    const id = pfleger._id;
    const prot1 = new Protokoll({ersteller: id, patient: "Gudrun", datum: new Date()});
    await prot1.save() 
    const start = new Date
    const end = await Protokoll.updateOne({patient: "Gudrun"}, {patient: "Gerlinde"}).exec().then(()=>new Date)
    
    
    const retrieve = await Protokoll.findOne({ patient: "Gerlinde" }).exec(); 
    const compare = retrieve!.updatedAt
    
    expect(()=>checkDate(start, end, compare!)).not.toThrowError()
})

function checkDate(start: Date, end: Date, compare: Date): void {
    if(compare<start || compare>end) {
        throw new Error("compare is NOT between start and end ")
    }
}

test("delete Protokoll Test", async () => {
    const pfleger = new Pfleger({ name: "Max", password: "1234" });
    await pfleger.save();
    
    const id = pfleger._id;
    const prot1 = new Protokoll({ersteller: id, patient: "Gudrun", datum: new Date()});
    await prot1.save() 
    
    await Protokoll.deleteOne({patient: "Gudrun"}).exec()

    const find = await Protokoll.findOne({patient: "Gudrun"}).exec()
    expect(find).toBeDefined()
    expect(find?.datum).toBeUndefined()
    expect(find?.patient).toBeUndefined()
})