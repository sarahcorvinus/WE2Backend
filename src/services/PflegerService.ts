import { Types } from "mongoose";
import { PflegerResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { Eintrag } from "../model/EintragModel";


/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getAllePfleger(): Promise<PflegerResource[]> {
    const pfleger = await Pfleger.find({}).exec();
    const pflegerResource = pfleger.map(pfl => ({ id: pfl.id, name: pfl.name, admin: pfl.admin! }));
    return pflegerResource;
}

/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
export async function createPfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    const pfR = pflegerResource;
    const create = await new Pfleger({ /* id: pfR.id, */ name: pfR.name, admin: pfR.admin, password: pfR.password }).save();
    return { id: create.id, name: create.name, admin: create.admin! };
}


/**
 * Updated einen Pfleger.
 * Beim Update wird der Pfleger über die ID identifiziert.
 * Der Admin kann einfach so ein neues Passwort setzen, ohne das alte zu kennen.
 */
export async function updatePfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    
    if (!pflegerResource.id)
        throw new Error("Please provide an ID to update!");
    
    const update = await Pfleger.findById(pflegerResource.id).exec();
    if (!update)
        throw new Error("Pfleger couldn't be found!");
    
    
    const pfR = pflegerResource;
    if(isDefined(pfR.name))
        update.name = pfR.name;
    if(isDefined(pfR.password))
        update.password = pfR.password!;
    if(isDefined(pfR.admin))
        update.admin = pfR.admin;

    function isDefined(x: any): boolean {
        return x !== undefined && x !== null;
    }

    await update.save();
    return { id: update.id, name: update.name, admin: update.admin! };
}

/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
export async function deletePfleger(id: string): Promise<void> {
    const remove = await Pfleger.deleteOne({_id: id}).exec();
    if(remove.deletedCount<1)
        throw new Error("Couldn't find Pfleger with id: " + id);

    // we also have to delete all entries that are in a Protokoll thats about to be deleted
    const protsByPfleger = await Protokoll.find({ersteller: new Types.ObjectId(id)}).exec()
    for (let i = 0; i < protsByPfleger.length; i++) {
        const el = protsByPfleger[i];
        await Eintrag.deleteMany({protokoll: new Types.ObjectId(el.id)}).exec()
    }

    await Protokoll.deleteMany({ersteller: new Types.ObjectId(id)}).exec()
    await Eintrag.deleteMany({ersteller: new Types.ObjectId(id)}).exec()

    return;
}