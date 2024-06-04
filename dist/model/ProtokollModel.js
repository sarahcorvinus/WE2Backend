"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Protokoll = void 0;
const mongoose_1 = require("mongoose");
const protokollSchema = new mongoose_1.Schema({
    ersteller: { type: mongoose_1.Schema.Types.ObjectId, ref: "Pfleger", required: true },
    patient: { type: String, required: true },
    datum: { type: Date, required: true },
    public: { type: Boolean, default: false },
    closed: { type: Boolean, default: false },
}, { timestamps: true });
exports.Protokoll = (0, mongoose_1.model)("Protokoll", protokollSchema);
//# sourceMappingURL=ProtokollModel.js.map