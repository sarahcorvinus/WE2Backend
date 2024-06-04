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
exports.eintragRouter = void 0;
const express_1 = __importDefault(require("express"));
const EintragService_1 = require("../services/EintragService");
const express_validator_1 = require("express-validator");
const authentication_1 = require("./authentication");
const ProtokollService_1 = require("../services/ProtokollService");
exports.eintragRouter = express_1.default.Router();
exports.eintragRouter.get("/:id", authentication_1.optionalAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        const get = yield (0, EintragService_1.getEintrag)(id);
        const prot = yield (0, ProtokollService_1.getProtokoll)(get.protokoll);
        if (!prot.public) {
            if (get.ersteller !== req.pflegerId && prot.ersteller !== req.pflegerId)
                res.sendStatus(403);
        }
        res.send(get);
    }
    catch (error) {
        res.sendStatus(404);
        // next(error);
    }
}));
exports.eintragRouter.post("/", authentication_1.requiresAuthentication, (0, express_validator_1.body)("getraenk").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("menge").isNumeric().isInt({ min: 1, max: 2000 }), (0, express_validator_1.body)("kommentar").optional().isString().isLength({ min: 1, max: 1000 }), (0, express_validator_1.body)("ersteller").isMongoId(), (0, express_validator_1.body)("protokoll").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() });
        return;
    }
    const entry = (0, express_validator_1.matchedData)(req);
    try {
        const prot = yield (0, ProtokollService_1.getProtokoll)(entry.protokoll);
        if (!prot.public && req.pflegerId !== prot.ersteller)
            res.sendStatus(403);
        const create = yield (0, EintragService_1.createEintrag)(entry);
        res.status(201).send(create);
    }
    catch (error) {
        res.status(400);
        next(error);
    }
}));
exports.eintragRouter.put("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("getraenk").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("menge").isNumeric().isInt({ min: 1, max: 2000 }), (0, express_validator_1.body)("kommentar").optional().isString().isLength({ min: 1, max: 1000 }), (0, express_validator_1.body)("ersteller").isMongoId(), (0, express_validator_1.body)("protokoll").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() });
        return;
    }
    const entryData = (0, express_validator_1.matchedData)(req);
    const id = req.params.id;
    if (id !== entryData.id) {
        res.status(400).send({
            errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
        });
        return;
    }
    try {
        const prot = yield (0, ProtokollService_1.getProtokoll)(entryData.protokoll);
        if (req.pflegerId !== entryData.ersteller && req.pflegerId !== prot.ersteller)
            res.sendStatus(403);
        const update = yield (0, EintragService_1.updateEintrag)(entryData);
        res.status(200).send(update);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
exports.eintragRouter.delete("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        const entry = yield (0, EintragService_1.getEintrag)(id);
        const prot = yield (0, ProtokollService_1.getProtokoll)(entry.protokoll);
        if (req.pflegerId !== entry.ersteller && req.pflegerId !== prot.ersteller)
            res.sendStatus(403);
        yield (0, EintragService_1.deleteEintrag)(id);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
//# sourceMappingURL=eintrag.js.map