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
exports.deletePfleger = exports.updatePfleger = exports.createPfleger = exports.getAllePfleger = void 0;
const mongoose_1 = require("mongoose");
const PflegerModel_1 = require("../model/PflegerModel");
const ProtokollModel_1 = require("../model/ProtokollModel");
const EintragModel_1 = require("../model/EintragModel");
/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
function getAllePfleger() {
    return __awaiter(this, void 0, void 0, function* () {
        const pfleger = yield PflegerModel_1.Pfleger.find({}).exec();
        const pflegerResource = pfleger.map(pfl => ({ id: pfl.id, name: pfl.name, admin: pfl.admin }));
        return pflegerResource;
    });
}
exports.getAllePfleger = getAllePfleger;
/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
function createPfleger(pflegerResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const pfR = pflegerResource;
        const create = yield new PflegerModel_1.Pfleger({ /* id: pfR.id, */ name: pfR.name, admin: pfR.admin, password: pfR.password }).save();
        return { id: create.id, name: create.name, admin: create.admin };
    });
}
exports.createPfleger = createPfleger;
/**
 * Updated einen Pfleger.
 * Beim Update wird der Pfleger über die ID identifiziert.
 * Der Admin kann einfach so ein neues Passwort setzen, ohne das alte zu kennen.
 */
function updatePfleger(pflegerResource) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!pflegerResource.id)
            throw new Error("Please provide an ID to update!");
        const update = yield PflegerModel_1.Pfleger.findById(pflegerResource.id).exec();
        if (!update)
            throw new Error("Pfleger couldn't be found!");
        const pfR = pflegerResource;
        if (isDefined(pfR.name))
            update.name = pfR.name;
        if (isDefined(pfR.password))
            update.password = pfR.password;
        if (isDefined(pfR.admin))
            update.admin = pfR.admin;
        function isDefined(x) {
            return x !== undefined && x !== null;
        }
        yield update.save();
        return { id: update.id, name: update.name, admin: update.admin };
    });
}
exports.updatePfleger = updatePfleger;
/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
function deletePfleger(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const remove = yield PflegerModel_1.Pfleger.deleteOne({ _id: id }).exec();
        if (remove.deletedCount < 1)
            throw new Error("Couldn't find Pfleger with id: " + id);
        // we also have to delete all entries that are in a Protokoll thats about to be deleted
        const protsByPfleger = yield ProtokollModel_1.Protokoll.find({ ersteller: new mongoose_1.Types.ObjectId(id) }).exec();
        for (let i = 0; i < protsByPfleger.length; i++) {
            const el = protsByPfleger[i];
            yield EintragModel_1.Eintrag.deleteMany({ protokoll: new mongoose_1.Types.ObjectId(el.id) }).exec();
        }
        yield ProtokollModel_1.Protokoll.deleteMany({ ersteller: new mongoose_1.Types.ObjectId(id) }).exec();
        yield EintragModel_1.Eintrag.deleteMany({ ersteller: new mongoose_1.Types.ObjectId(id) }).exec();
        return;
    });
}
exports.deletePfleger = deletePfleger;
//# sourceMappingURL=PflegerService.js.map