"use strict";
// istanbul ignore file
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
exports.prefillDB = void 0;
const logger_1 = require("./logger");
const EintragModel_1 = require("./model/EintragModel");
const PflegerModel_1 = require("./model/PflegerModel");
const ProtokollModel_1 = require("./model/ProtokollModel");
const EintragService_1 = require("./services/EintragService");
const PflegerService_1 = require("./services/PflegerService");
const ProtokollService_1 = require("./services/ProtokollService");
/**
 * Erzeugt einen Benutzer "Behrens" und ein paar vom ihm angelegte Protokolle mit Einträgen.
 * Diese Funktion benötigen wir später zu Testzwecken im Frontend.
*/
function prefillDB() {
    return __awaiter(this, void 0, void 0, function* () {
        yield PflegerModel_1.Pfleger.syncIndexes();
        yield ProtokollModel_1.Protokoll.syncIndexes();
        yield EintragModel_1.Eintrag.syncIndexes();
        const behrens = yield (0, PflegerService_1.createPfleger)({ name: "Behrens", password: "123_abc_ABC", admin: true });
        logger_1.logger.info(`Prefill DB with test data, pfleger: ${behrens.name}, password 123_abc_ABC`);
        const protokolle = [];
        const itemsPerList = [[1, 4, 2, 0], [3, 5, 7]];
        const patienten = ["Hans", "Clawdia"];
        const datumPostfix = [".10.1907", ".11.1907"];
        const publicValue = [true, false];
        const getraenke = ["Kaffee", "Tee", "Sekt", "Limo"];
        const mengen = [150, 180, 200, 300];
        for (let k = 0; k < 2; k++) {
            for (let i = 0; i < itemsPerList[k].length; i++) {
                const protokoll = yield (0, ProtokollService_1.createProtokoll)({ patient: patienten[k], datum: (i + 1) + datumPostfix[k], public: publicValue[k], ersteller: behrens.id, closed: false });
                let gesamtMenge = 0;
                for (let m = 0; m < itemsPerList[k][i]; m++) {
                    const eintrag = yield (0, EintragService_1.createEintrag)({
                        getraenk: getraenke[m % getraenke.length], menge: mengen[m % mengen.length],
                        protokoll: protokoll.id, ersteller: behrens.id
                    });
                    gesamtMenge += eintrag.menge;
                }
                protokolle.push(Object.assign(Object.assign({}, protokoll), { gesamtMenge: gesamtMenge }));
            }
        }
        return { behrens, protokolle };
    });
}
exports.prefillDB = prefillDB;
//# sourceMappingURL=prefill.js.map