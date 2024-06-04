import { ProtokollResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";
import { Eintrag } from "../model/EintragModel";

/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
export async function getAlleProtokolle(pflegerId?: string): Promise<ProtokollResource[]> {
    let prots = await Protokoll.find({public: true}).exec()

    let personals;
    if(pflegerId) {
        personals = await Protokoll.find({ersteller: pflegerId, public: false}).exec()
        prots = prots.concat(personals)
    }

    let map: ProtokollResource[] = [];
    /* for (let i = 0; i < prots.length; i++) {
        const pr = prots[i];
        const pfleger = await Pfleger.findById(pr.ersteller).exec()

        const eintraege = await Eintrag.find({protokoll: pr.id}).exec()
        let menge = 0;
        for (let i = 0; i < eintraege.length; i++) {
            menge += eintraege[i].menge
        }
        
        map[i] = {id: pr.id, 
            patient: pr.patient,
            datum: dateToString(pr.datum), 
            public: pr.public,
            closed: pr.closed, 
            ersteller: pr.ersteller.toString(),
            erstellerName: pfleger?.name,
            updatedAt: dateToString(pr.updatedAt!),
            gesamtMenge: menge
               }
    } */
    for (let i = 0; i < prots.length; i++) {
        map[i] = await getProtokoll(prots[i].id)
    }
    return map;
}

 /**
  * Liefer die Protokoll mit angegebener ID.
 * Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
**/
export async function getProtokoll(id: string): Promise<ProtokollResource> {

    const find = await Protokoll.findById(id).exec()
    if(!find)
        throw new Error("No Protokoll matching the provided ID could be found!")

    const pfleger = await Pfleger.findById(find.ersteller).exec()
    const eintraege = await Eintrag.find({protokoll: id}).exec()

    let menge = 0;

    for (let i = 0; i < eintraege.length; i++) {
        menge += eintraege[i].menge
    }

    return {
            id: find.id,
            patient: find.patient, 
            datum: dateToString(find.datum), 
            public: find.public,
            closed: find.closed,
            ersteller: find.ersteller.toString(),
            erstellerName: pfleger!.name,
            updatedAt: dateToString(find.updatedAt!),
            gesamtMenge: menge
        }
}

/**
 * Erzeugt das Protokoll.
 * 
 */
export async function createProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {
    const pr = protokollResource;

    // await patientDateAlreadyThere(pr.patient, stringToDate(pr.datum));
    const constraintCandidates = await Protokoll.find({patient: pr.patient}).exec()
    for(let i = 0; i<constraintCandidates.length; i++) {
        if(pr.datum==dateToString(constraintCandidates[i].datum)) {
            throw new Error("There is already a Protokoll for that date for patient "+pr.patient)
        }
    }
    /// WTF why doesn't below code work
    /* const constraintCandidates = await Protokoll.find({patient: pr.patient}).exec()
    for(let i = 0; i<constraintCandidates.length; i++) {
        if(stringToDate(pr.datum).getTime()==constraintCandidates[i].datum.getTime()) {
            throw new Error("There is already a Protokoll for that date for patient "+pr.patient)
        }
    } */
    
    await Pfleger.findById(pr.ersteller).exec()
                .then((res)=>{
                        pr.erstellerName = res!.name
                })
                .catch(()=>{throw new Error("Seems there is no Pfleger with that id!")})
    

    const create = await Protokoll.create({ patient: pr.patient, 
                                            datum: pr.datum, public: pr.public, 
                                            closed: pr.closed, ersteller: pr.ersteller, 
                                            erstellerName: pr.erstellerName})

    return {
        id: create.id,
        patient: create.patient,
        datum: dateToString(create.datum),
        public: create.public,
        closed: create.closed,
        ersteller: create.ersteller.toString(),
        erstellerName: pr.erstellerName,
        updatedAt: dateToString(create.updatedAt!),
        gesamtMenge: 0
    };
}

/**
 * Ändert die Daten einer Protokoll.
 */
export async function updateProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {
    const pr = protokollResource;
    
    const constraintCandidates = await Protokoll.find({patient: pr.patient}).exec()
    for(let i = 0; i<constraintCandidates.length; i++) {
        if(pr.datum==dateToString(constraintCandidates[i].datum)) {
            throw new Error("There is already a Protokoll for that date for patient "+pr.patient)
        }
    }
    
    const update = await Protokoll.findById(pr.id).exec()
    if (!update  || !pr.id )
        throw new Error("Protokoll couldn't be found!");

    
    if(isDefined(pr.patient))
        update.patient = pr.patient
    if(isDefined(pr.datum))
        update.datum = stringToDate(pr.datum)
    if(isDefined(pr.public))
        update.public = pr.public
    if(isDefined(pr.closed))
        update.closed = pr.closed
    // if(isDefined(pr.ersteller))
    //     update.ersteller = new Types.ObjectId(pr.ersteller)

    function isDefined(x: any): boolean {
        return x !== undefined && x !== null;
    }

    const pfleger = await Pfleger.findById(pr.ersteller).exec()

    await update.save()
    /* return {id: update.id, 
            patient: update.patient,
            datum: dateToString(update.datum), 
            public: update.public,
            closed:  update.closed, 
            ersteller: update.ersteller.toString(),
            erstellerName: pfleger!.name,
        } */
    return getProtokoll(update.id);
}

/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
export async function deleteProtokoll(id: string): Promise<void> {
    const remove = await Protokoll.deleteOne({_id: id}).exec();
    if(remove.deletedCount<1)
        throw new Error("Couldn't find Protokoll with id: " + id);

    await Eintrag.deleteMany({protokoll: id}).exec();
    
    return;
}    


/* async function patientDateAlreadyThere(patient: string, date: Date) {
    const constraintCandidates = await Protokoll.find({patient: patient}).exec()
    for(let i = 0; i<constraintCandidates.length; i++) {
        if(date.getTime()===constraintCandidates[i].datum.getTime()) {
            throw new Error("There is already a Protokoll for that date for patient "+patient)
        }
    }
} */