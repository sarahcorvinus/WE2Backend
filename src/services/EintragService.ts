import { Types, Document, HydratedDocument } from "mongoose";
import { EintragResource } from "../Resources";
import { Eintrag, IEintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString } from "./ServiceHelper";

/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleEintraege(protokollId: string): Promise<EintragResource[]> {
    const find = await Protokoll.findById(protokollId).exec()
    if(!find)
        throw new Error("Couldn't find Protokoll with id "+protokollId)
    const entries = await Eintrag.find({protokoll: new Types.ObjectId(protokollId)}).exec()
    
    let map: EintragResource[] = [];
    /* for (let i = 0; i < entries.length; i++) {
        const el = entries[i];
        const pflegerName = await Pfleger.findById(el.ersteller).exec().then((res)=>res!.name)
        map[i] = {id: el.id, getraenk: el.getraenk, menge: el.menge, 
                kommentar: el.kommentar, ersteller: el.ersteller.toString(), 
                erstellerName: pflegerName, createdAt: dateToString(el.createdAt!), 
                protokoll: el.protokoll.toString()}
    } */
    for (let i = 0; i < entries.length; i++) {
        map[i] = await getEintrag(entries[i].id);
    }
    return map;
}


/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
export async function getEintrag(id: string): Promise<EintragResource> {
    
    const find = await Eintrag.findById(id).exec()
    if(!find)
        throw new Error("Couldn't find Eintrag with id: "+ id);
    
    const pfleger = await Pfleger.findById(find.ersteller).exec()
    return {
        id: find.id,
        getraenk: find.getraenk,
        menge: find.menge,
        kommentar: find.kommentar,
        ersteller: find.ersteller.toString(),
        erstellerName: pfleger!.name,
        createdAt: dateToString(find.createdAt!),
        protokoll: find.protokoll.toString()
    }
}

/**
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden, aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
export async function createEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    const pfleger = await Pfleger.findById(eintragResource.ersteller).exec();
    if (!pfleger) {
        throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
    }
    const protokoll = await Protokoll.findById(eintragResource.protokoll).exec();
    if (!protokoll) {
        throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
    }
    if (protokoll.closed) {
        throw new Error(`Protokoll ${protokoll.id} is already closed`);
    }

    const eintrag = await Eintrag.create({
        getraenk: eintragResource.getraenk,
        menge: eintragResource.menge,
        kommentar: eintragResource.kommentar,
        ersteller: eintragResource.ersteller,
        protokoll: eintragResource.protokoll
    })
    return {
        id: eintrag.id,
        getraenk: eintrag.getraenk,
        menge: eintrag.menge,
        kommentar: eintrag.kommentar,
        ersteller: pfleger.id,
        erstellerName: pfleger.name,
        createdAt: dateToString(eintrag.createdAt!),
        protokoll: protokoll.id
    }
}


/**
 * Updated einen Eintrag. Es können nur Getränk, Quantity und Remarks geändert werden.
 * Aktuell können Einträge nicht von einem Protokoll in einen anderes verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
export async function updateEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    const er = eintragResource;

    if(!er.id) {
        throw new Error("Please provide an id to search for.");
    }
    const update = await Eintrag.findById(er.id).exec()
    if(!update){
        throw new Error("Couldn't find Eintrag with id: "+er.id);
    }
    
    if(isDefined(er.menge))
        update.menge = er.menge
    if(isDefined(er.getraenk))
        update.getraenk = er.getraenk
    if(isDefined(er.kommentar))
        update.kommentar = er.kommentar

    function isDefined(x: any): boolean{
        return x !== undefined && x !== null;
    }

    // const save = await update.save()
    // const pfleger = await Pfleger.findById(update!.ersteller).exec()
    
    /* return {
        id: save.id,
        getraenk: save.getraenk,
        menge: save.menge,
        ersteller: save.ersteller.toString(),
        erstellerName: pfleger!.name,
        createdAt: dateToString(save.createdAt!),
        protokoll: save.protokoll.toString()
    } */
    await update.save()
    return getEintrag(update.id);
}


/**
 * Beim Löschen wird der Eintrag über die ID identifiziert. 
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteEintrag(id: string): Promise<void> {
    if(!id)
        throw new Error("Please provide an ID.")
    const remove = await Eintrag.deleteOne({_id: id}).exec()
    if(remove.deletedCount<1)
        throw new Error("Could not be deleted")
    return;
}

