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
exports.protokollRouter = void 0;
const express_1 = __importDefault(require("express"));
const EintragService_1 = require("../services/EintragService");
const ProtokollService_1 = require("../services/ProtokollService");
const express_validator_1 = require("express-validator");
const authentication_1 = require("./authentication");
const ProtokollModel_1 = require("../model/ProtokollModel");
exports.protokollRouter = express_1.default.Router();
exports.protokollRouter.put("/alle", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(404);
}));
exports.protokollRouter.get("/:id/eintraege", authentication_1.optionalAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        const prot = yield (0, ProtokollService_1.getProtokoll)(id);
        if (!prot.public && req.pflegerId !== prot.ersteller.toString()) {
            // if(req.pflegerId !== prot.ersteller.toString()) {
            res.sendStatus(403);
            // }
        }
        const eintraege = yield (0, EintragService_1.getAlleEintraege)(id);
        res.send(eintraege); // 200 by default
    }
    catch (err) {
        res.status(404); // not found
        next(err);
    }
}));
exports.protokollRouter.get("/alle", authentication_1.optionalAuthentication, (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.pflegerId;
    const prots = yield (0, ProtokollService_1.getAlleProtokolle)(id);
    res.send(prots);
}));
exports.protokollRouter.get("/:id", authentication_1.optionalAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    try {
        const id = req.params.id;
        const protokoll = yield (0, ProtokollService_1.getProtokoll)(id);
        if (protokoll.public)
            res.send(protokoll); // 200 by default
        if (id !== protokoll.ersteller.toString())
            res.sendStatus(403);
        res.send(protokoll);
    }
    catch (err) {
        res.status(404); // not found
        next(err);
    }
}));
exports.protokollRouter.delete("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    try {
        const id = req.params.id;
        const prot = yield ProtokollModel_1.Protokoll.findById(id).exec();
        if (req.pflegerId !== prot.ersteller.toString())
            res.sendStatus(403);
        yield (0, ProtokollService_1.deleteProtokoll)(id);
        res.sendStatus(204);
    }
    catch (err) {
        res.status(404);
        next(err);
    }
}));
/* HTTP POST: Meist zum Anlegen einer neuen Resource,
  diese wird vom Sender mitgeschickt */
/* HTTP PUT: Resource soll verändert werden, d.h. der bestehende
  Inhalt durch die mitgeschickte Repräsentation ersetzt werden. */
exports.protokollRouter.post("/", authentication_1.requiresAuthentication, (0, express_validator_1.body)("patient").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("datum").isDate({ format: "DD.MM.YYYY", delimiters: ["."] }), (0, express_validator_1.body)("public").optional().isBoolean(), (0, express_validator_1.body)("closed").optional().isBoolean(), (0, express_validator_1.body)("ersteller").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const protData = (0, express_validator_1.matchedData)(req);
    if (protData.ersteller !== req.pflegerId)
        res.sendStatus(403);
    try {
        const createdProt = yield (0, ProtokollService_1.createProtokoll)(protData);
        res.status(201).send(createdProt);
    }
    catch (error) {
        const e = error;
        if (e.message.startsWith("Seems there is no Pfleger with that id!"))
            res.status(400).send({ errors: [{ location: "body", path: "ersteller", msg: "No Pfleger with that ID found!", value: protData.ersteller }] });
        res.status(400);
        next(error);
    }
}));
exports.protokollRouter.put("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("patient").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("datum").isDate({ format: "DD.MM.YYYY", delimiters: ["."] }), (0, express_validator_1.body)("public").optional().isBoolean(), (0, express_validator_1.body)("closed").optional().isBoolean(), (0, express_validator_1.body)("ersteller").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    const protData = (0, express_validator_1.matchedData)(req);
    if (id !== protData.id) {
        res.status(400).send({
            errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
        });
        return;
    }
    try {
        // TODO maybe write custom validation error + tests for below
        const id = req.params.id;
        const prot = yield ProtokollModel_1.Protokoll.findById(id).exec();
        if (req.pflegerId !== prot.ersteller.toString())
            res.sendStatus(403);
        const update = yield (0, ProtokollService_1.updateProtokoll)(protData);
        res.status(200).send(update);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
//# sourceMappingURL=protokoll.js.map