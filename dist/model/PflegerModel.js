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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pfleger = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
;
;
const pflegerSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
});
pflegerSchema.pre("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            const hashedPassword = yield bcryptjs_1.default.hash(this.password, 10);
            this.password = hashedPassword;
        }
    });
});
pflegerSchema.pre("updateOne", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const update = this.getUpdate();
        if (update && "password" in update) {
            const hashedPassword = yield bcryptjs_1.default.hash(update.password, 10);
            update.password = hashedPassword;
        }
    });
});
pflegerSchema.method("isCorrectPassword", function (toCheck) {
    if (this.isModified("password")) {
        throw new Error("Error! Can't compare password, some updates aren't yet saved.");
    }
    const isCorrect = bcryptjs_1.default.compare(toCheck, this.password);
    return isCorrect;
});
exports.Pfleger = (0, mongoose_1.model)("Pfleger", pflegerSchema);
//# sourceMappingURL=PflegerModel.js.map