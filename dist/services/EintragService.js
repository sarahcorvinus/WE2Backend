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
exports.deleteEintrag = exports.updateEintrag = exports.createEintrag = exports.getEintrag = exports.getAlleEintraege = void 0;
const mongoose_1 = require("mongoose");
const EintragModel_1 = require("../model/EintragModel");
const PflegerModel_1 = require("../model/PflegerModel");
const ProtokollModel_1 = require("../model/ProtokollModel");
const ServiceHelper_1 = require("./ServiceHelper");
/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
function getAlleEintraege(protokollId) {
    return __awaiter(this, void 0, void 0, function* () {
        const find = yield ProtokollModel_1.Protokoll.findById(protokollId).exec();
        if (!find)
            throw new Error("Couldn't find Protokoll with id " + protokollId);
        const entries = yield EintragModel_1.Eintrag.find({ protokoll: new mongoose_1.Types.ObjectId(protokollId) }).exec();
        let map = [];
        /* for (let i = 0; i < entries.length; i++) {
            const el = entries[i];
            const pflegerName = await Pfleger.findById(el.ersteller).exec().then((res)=>res!.name)
            map[i] = {id: el.id, getraenk: el.getraenk, menge: el.menge,
                    kommentar: el.kommentar, ersteller: el.ersteller.toString(),
                    erstellerName: pflegerName, createdAt: dateToString(el.createdAt!),
                    protokoll: el.protokoll.toString()}
        } */
        for (let i = 0; i < entries.length; i++) {
            map[i] = yield getEintrag(entries[i].id);
        }
        return map;
    });
}
exports.getAlleEintraege = getAlleEintraege;
/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
function getEintrag(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const find = yield EintragModel_1.Eintrag.findById(id).exec();
        if (!find)
            throw new Error("Couldn't find Eintrag with id: " + id);
        const pfleger = yield PflegerModel_1.Pfleger.findById(find.ersteller).exec();
        return {
            id: find.id,
            getraenk: find.getraenk,
            menge: find.menge,
            kommentar: find.kommentar,
            ersteller: find.ersteller.toString(),
            erstellerName: pfleger.name,
            createdAt: (0, ServiceHelper_1.dateToString)(find.createdAt),
            protokoll: find.protokoll.toString()
        };
    });
}
exports.getEintrag = getEintrag;
/**
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden, aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
function createEintrag(eintragResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const pfleger = yield PflegerModel_1.Pfleger.findById(eintragResource.ersteller).exec();
        if (!pfleger) {
            throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
        }
        const protokoll = yield ProtokollModel_1.Protokoll.findById(eintragResource.protokoll).exec();
        if (!protokoll) {
            throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
        }
        if (protokoll.closed) {
            throw new Error(`Protokoll ${protokoll.id} is already closed`);
        }
        const eintrag = yield EintragModel_1.Eintrag.create({
            getraenk: eintragResource.getraenk,
            menge: eintragResource.menge,
            kommentar: eintragResource.kommentar,
            ersteller: eintragResource.ersteller,
            protokoll: eintragResource.protokoll
        });
        return {
            id: eintrag.id,
            getraenk: eintrag.getraenk,
            menge: eintrag.menge,
            kommentar: eintrag.kommentar,
            ersteller: pfleger.id,
            erstellerName: pfleger.name,
            createdAt: (0, ServiceHelper_1.dateToString)(eintrag.createdAt),
            protokoll: protokoll.id
        };
    });
}
exports.createEintrag = createEintrag;
/**
 * Updated einen Eintrag. Es können nur Getränk, Quantity und Remarks geändert werden.
 * Aktuell können Einträge nicht von einem Protokoll in einen anderes verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
function updateEintrag(eintragResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const er = eintragResource;
        if (!er.id) {
            throw new Error("Please provide an id to search for.");
        }
        const update = yield EintragModel_1.Eintrag.findById(er.id).exec();
        if (!update) {
            throw new Error("Couldn't find Eintrag with id: " + er.id);
        }
        if (isDefined(er.menge))
            update.menge = er.menge;
        if (isDefined(er.getraenk))
            update.getraenk = er.getraenk;
        if (isDefined(er.kommentar))
            update.kommentar = er.kommentar;
        function isDefined(x) {
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
        yield update.save();
        return getEintrag(update.id);
    });
}
exports.updateEintrag = updateEintrag;
/**
 * Beim Löschen wird der Eintrag über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
function deleteEintrag(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id)
            throw new Error("Please provide an ID.");
        const remove = yield EintragModel_1.Eintrag.deleteOne({ _id: id }).exec();
        if (remove.deletedCount < 1)
            throw new Error("Could not be deleted");
        return;
    });
}
exports.deleteEintrag = deleteEintrag;
//# sourceMappingURL=EintragService.js.map