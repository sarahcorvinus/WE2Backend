import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService"
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

test("Pfleger can only be deleted by admin, negative case",  
    async () => {
        const peter = await createPfleger({name: "Peter", password: "Eintr4g#", admin: false});
        await performAuthentication("Peter", "Eintr4g#");
        const testee = supertestWithAuth(app);

        const max = await createPfleger({name: "Max", password: "Schl4ng³", admin: false});
        const del = await testee.delete(`/api/pfleger/${max.id!}`)
    expect(del.statusCode).toBe(403);
})

test("Pfleger can only be deleted by admin, positive case",  
    async () => {
        const peter = await createPfleger({name: "Peter", password: "Eintr4g#", admin: true});
        await performAuthentication("Peter", "Eintr4g#");
        const testee = supertestWithAuth(app);

        const max = await createPfleger({name: "Max", password: "Schl4ng³", admin: false});
        const del = await testee.delete(`/api/pfleger/${max.id!}`)
    expect(del.statusCode).toBe(204);
})

test("Pfleger can not be deleted by himself",  
    async () => {
        const peter = await createPfleger({name: "Peter", password: "Eintr4g#", admin: true});
        await performAuthentication("Peter", "Eintr4g#");
        const testee = supertestWithAuth(app);

        const del = await testee.delete(`/api/pfleger/${peter.id!}`)
    expect(del.statusCode).toBe(403);
})