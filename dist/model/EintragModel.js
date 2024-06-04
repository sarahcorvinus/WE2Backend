"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eintrag = void 0;
const mongoose_1 = require("mongoose");
const eintragSchema = new mongoose_1.Schema({
    ersteller: { type: mongoose_1.Schema.Types.ObjectId, ref: "Pfleger", required: true },
    protokoll: { type: mongoose_1.Schema.Types.ObjectId, ref: "Protokoll", required: true },
    getraenk: { type: String, required: true },
    menge: { type: Number, required: true },
    kommentar: { type: String }
}, { timestamps: true });
exports.Eintrag = (0, mongoose_1.model)("Eintrag", eintragSchema);
//# sourceMappingURL=EintragModel.js.map