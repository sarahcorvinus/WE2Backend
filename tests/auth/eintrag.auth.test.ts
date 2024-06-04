import dotenv from "dotenv";
dotenv.config();

import app from "../../src/app";
import { createEintrag, getEintrag } from "../../src/services/EintragService";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


test("/api/eintrag/:id get mit Login (Positivfall) \
    requester is ersteller of prot && entry", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
    
        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: peter.id!, public: false})
        const entry = await createEintrag({getraenk: "Milch", menge: 200, ersteller: peter.id!, protokoll: prot.id!})
    
        const get = await testee.get(`/api/eintrag/${entry.id!}`)
        expect(get.statusCode).toBe(200)
})

test("/api/eintrag/:id get mit Login (Positivfall) \
    requester is ersteller of entry only", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})

        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: max.id!, public: false})
        const entry = await createEintrag({getraenk: "Milch", menge: 200, ersteller: peter.id!, protokoll: prot.id!})

        const get = await testee.get(`/api/eintrag/${entry.id!}`)
    expect(get.statusCode).toBe(200)
})

test("/api/eintrag/:id get mit Login (Positivfall) \
    requester is ersteller of prot only", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})

        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: peter.id!, public: false})
        const entry = await createEintrag({getraenk: "Milch", menge: 200, ersteller: max.id!, protokoll: prot.id!})

        const get = await testee.get(`/api/eintrag/${entry.id!}`)
    expect(get.statusCode).toBe(200)
})

test("/api/eintrag/:id get mit Login (Negativfall) \
    requester is neither ersteller of prot nor entry", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const erna = await createPfleger({name: "Erna Emilia", password: "VerrÄt!chd1chNet", admin: false})

        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: erna.id!, public: false})
        const entry = await createEintrag({getraenk: "Milch", menge: 200, ersteller: max.id!, protokoll: prot.id!})

        const get = await testee.get(`/api/eintrag/${entry.id!}`)
    expect(get.statusCode).toBe(403)
})

test("/api/eintrag/:id get mit Login (Positivfall, bc prot is public) \
    requester is neither ersteller of prot nor entry", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        
        const testee = supertestWithAuth(app);
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const erna = await createPfleger({name: "Erna Emilia", password: "VerrÄt!chd1chNet", admin: false})

        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: erna.id!, public: true})
        const entry = await createEintrag({getraenk: "Milch", menge: 200, ersteller: max.id!, protokoll: prot.id!})

        const get = await testee.get(`/api/eintrag/${entry.id!}`)
    expect(get.statusCode).toBe(200)
})

test("/api/eintrag/:id POST, posting into a private prot only possible if I am the owner\
    Negativfall", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);

        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: max.id!, public: false})
        
        const entry = await testee.post("/api/eintrag").send({getraenk: "Milch", menge: 200, ersteller: peter.id!, protokoll: prot.id!})
    expect(entry.statusCode).toBe(403);    
})

test("/api/eintrag/:id POST, posting into a private prot only possible if I am the owner\
    Positivfall", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: peter.id!, public: false})
        
        const entry = await testee.post("/api/eintrag").send({getraenk: "Milch", menge: 200, ersteller: peter.id!, protokoll: prot.id!})
    expect(entry.statusCode).toBe(201);    
})

test("/api/eintrag/:id POST, posting into a private prot only possible if I am the owner\
    Negativfall", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gudrun", datum: "01.01.1970", ersteller: max.id!, public: false})
        
        const entry = await testee.post("/api/eintrag").send({getraenk: "Milch", menge: 200, ersteller: peter.id!, protokoll: prot.id!})
    expect(entry.statusCode).toBe(403);    
})

test("/api/eintrag/:id PUT, can only change own entry (positive case)\
    requester owns entry, but not prot", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gerlinde", datum: "02.02.1971", ersteller: max.id!, public: true})

        const create = await createEintrag({getraenk: "Milch", menge: 200, ersteller: peter.id!, protokoll: prot.id!});
        const get = await getEintrag(create.id!)
        get.getraenk = "Wasser";
        const update = await testee.put(`/api/eintrag/${create.id}`).send(get)

    expect(update.statusCode).toBe(200)
})

test("eintrag delete, deletion of own entry, sb elses prot", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gerlinde", datum: "02.02.1971", ersteller: max.id!, public: true})
        const entry = await createEintrag({getraenk: "Wasser", menge: 200, ersteller: peter.id!, protokoll: prot.id!})

        const del = await testee.delete(`/api/eintrag/${entry.id!}`)
    expect(del.statusCode).toBe(204)
})

test("eintrag delete, deletion of sb elses entry, sb elses prot", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gerlinde", datum: "02.02.1971", ersteller: max.id!, public: true})
        const entry = await createEintrag({getraenk: "Wasser", menge: 200, ersteller: max.id!, protokoll: prot.id!})

        const del = await testee.delete(`/api/eintrag/${entry.id!}`)
    expect(del.statusCode).toBe(403)
})

test("eintrag delete, deletion of own entry, own prot", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const prot = await createProtokoll({patient: "Gerlinde", datum: "02.02.1971", ersteller: peter.id!, public: true})
        const entry = await createEintrag({getraenk: "Wasser", menge: 200, ersteller: peter.id!, protokoll: prot.id!})

        const del = await testee.delete(`/api/eintrag/${entry.id!}`)
    expect(del.statusCode).toBe(204)
})

test("eintrag delete, deletion of sb elses entry and prot", 
    async () => {
        const peter = await createPfleger({name: "Peter-Fox", password:"ÜbelGeh4im&/", admin:false})
        await performAuthentication("Peter-Fox", "ÜbelGeh4im&/");
        const testee = supertestWithAuth(app);
        
        const max = await createPfleger({name: "Max", password: "myS3cretPW!", admin: false})
        const prot = await createProtokoll({patient: "Gerlinde", datum: "02.02.1971", ersteller: max.id!, public: true})
        const entry = await createEintrag({getraenk: "Wasser", menge: 200, ersteller: max.id!, protokoll: prot.id!})

        const del = await testee.delete(`/api/eintrag/${entry.id!}`)
    expect(del.statusCode).toBe(403)
})
