"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProtokoll = exports.updateProtokoll = exports.createProtokoll = exports.getProtokoll = exports.getAlleProtokolle = void 0;
const PflegerModel_1 = require("../model/PflegerModel");
const ProtokollModel_1 = require("../model/ProtokollModel");
const ServiceHelper_1 = require("./ServiceHelper");
const EintragModel_1 = require("../model/EintragModel");
/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
function getAlleProtokolle(pflegerId) {
    return __awaiter(this, void 0, void 0, function* () {
        let prots = yield ProtokollModel_1.Protokoll.find({ public: true }).exec();
        let personals;
        if (pflegerId) {
            personals = yield ProtokollModel_1.Protokoll.find({ ersteller: pflegerId, public: false }).exec();
            prots = prots.concat(personals);
        }
        let map = [];
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
            map[i] = yield getProtokoll(prots[i].id);
        }
        return map;
    });
}
exports.getAlleProtokolle = getAlleProtokolle;
/**
 * Liefer die Protokoll mit angegebener ID.
* Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
**/
function getProtokoll(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const find = yield ProtokollModel_1.Protokoll.findById(id).exec();
        if (!find)
            throw new Error("No Protokoll matching the provided ID could be found!");
        const pfleger = yield PflegerModel_1.Pfleger.findById(find.ersteller).exec();
        const eintraege = yield EintragModel_1.Eintrag.find({ protokoll: id }).exec();
        let menge = 0;
        for (let i = 0; i < eintraege.length; i++) {
            menge += eintraege[i].menge;
        }
        return {
            id: find.id,
            patient: find.patient,
            datum: (0, ServiceHelper_1.dateToString)(find.datum),
            public: find.public,
            closed: find.closed,
            ersteller: find.ersteller.toString(),
            erstellerName: pfleger.name,
            updatedAt: (0, ServiceHelper_1.dateToString)(find.updatedAt),
            gesamtMenge: menge
        };
    });
}
exports.getProtokoll = getProtokoll;
/**
 * Erzeugt das Protokoll.
 *
 */
function createProtokoll(protokollResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const pr = protokollResource;
        // await patientDateAlreadyThere(pr.patient, stringToDate(pr.datum));
        const constraintCandidates = yield ProtokollModel_1.Protokoll.find({ patient: pr.patient }).exec();
        for (let i = 0; i < constraintCandidates.length; i++) {
            if (pr.datum == (0, ServiceHelper_1.dateToString)(constraintCandidates[i].datum)) {
                throw new Error("There is already a Protokoll for that date for patient " + pr.patient);
            }
        }
        /// WTF why doesn't below code work
        /* const constraintCandidates = await Protokoll.find({patient: pr.patient}).exec()
        for(let i = 0; i<constraintCandidates.length; i++) {
            if(stringToDate(pr.datum).getTime()==constraintCandidates[i].datum.getTime()) {
                throw new Error("There is already a Protokoll for that date for patient "+pr.patient)
            }
        } */
        yield PflegerModel_1.Pfleger.findById(pr.ersteller).exec()
            .then((res) => {
            pr.erstellerName = res.name;
        })
            .catch(() => { throw new Error("Seems there is no Pfleger with that id!"); });
        const create = yield ProtokollModel_1.Protokoll.create({ patient: pr.patient,
            datum: pr.datum, public: pr.public,
            closed: pr.closed, ersteller: pr.ersteller,
            erstellerName: pr.erstellerName });
        return {
            id: create.id,
            patient: create.patient,
            datum: (0, ServiceHelper_1.dateToString)(create.datum),
            public: create.public,
            closed: create.closed,
            ersteller: create.ersteller.toString(),
            erstellerName: pr.erstellerName,
            updatedAt: (0, ServiceHelper_1.dateToString)(create.updatedAt),
            gesamtMenge: 0
        };
    });
}
exports.createProtokoll = createProtokoll;
/**
 * Ändert die Daten einer Protokoll.
 */
function updateProtokoll(protokollResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const pr = protokollResource;
        const constraintCandidates = yield ProtokollModel_1.Protokoll.find({ patient: pr.patient }).exec();
        for (let i = 0; i < constraintCandidates.length; i++) {
            if (pr.datum == (0, ServiceHelper_1.dateToString)(constraintCandidates[i].datum)) {
                throw new Error("There is already a Protokoll for that date for patient " + pr.patient);
            }
        }
        const update = yield ProtokollModel_1.Protokoll.findById(pr.id).exec();
        if (!update || !pr.id)
            throw new Error("Protokoll couldn't be found!");
        if (isDefined(pr.patient))
            update.patient = pr.patient;
        if (isDefined(pr.datum))
            update.datum = (0, ServiceHelper_1.stringToDate)(pr.datum);
        if (isDefined(pr.public))
            update.public = pr.public;
        if (isDefined(pr.closed))
            update.closed = pr.closed;
        // if(isDefined(pr.ersteller))
        //     update.ersteller = new Types.ObjectId(pr.ersteller)
        function isDefined(x) {
            return x !== undefined && x !== null;
        }
        const pfleger = yield PflegerModel_1.Pfleger.findById(pr.ersteller).exec();
        yield update.save();
        /* return {id: update.id,
                patient: update.patient,
                datum: dateToString(update.datum),
                public: update.public,
                closed:  update.closed,
                ersteller: update.ersteller.toString(),
                erstellerName: pfleger!.name,
            } */
        return getProtokoll(update.id);
    });
}
exports.updateProtokoll = updateProtokoll;
/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
function deleteProtokoll(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const remove = yield ProtokollModel_1.Protokoll.deleteOne({ _id: id }).exec();
        if (remove.deletedCount < 1)
            throw new Error("Couldn't find Protokoll with id: " + id);
        yield EintragModel_1.Eintrag.deleteMany({ protokoll: id }).exec();
        return;
    });
}
exports.deleteProtokoll = deleteProtokoll;
/* async function patientDateAlreadyThere(patient: string, date: Date) {
    const constraintCandidates = await Protokoll.find({patient: patient}).exec()
    for(let i = 0; i<constraintCandidates.length; i++) {
        if(date.getTime()===constraintCandidates[i].datum.getTime()) {
            throw new Error("There is already a Protokoll for that date for patient "+patient)
        }
    }
} */ 
//# sourceMappingURL=ProtokollService.js.map