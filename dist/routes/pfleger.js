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
exports.pflegerRouter = void 0;
const express_1 = __importDefault(require("express"));
const PflegerService_1 = require("../services/PflegerService");
const express_validator_1 = require("express-validator");
const authentication_1 = require("./authentication");
exports.pflegerRouter = express_1.default.Router();
exports.pflegerRouter.put("/alle", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(404);
}));
exports.pflegerRouter.delete("/alle", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(404);
}));
exports.pflegerRouter.get("/alle", authentication_1.requiresAuthentication, (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const role = req.role;
    if (role === "a") {
        const get = yield (0, PflegerService_1.getAllePfleger)();
        res.send(get);
    }
    res.sendStatus(403);
}));
exports.pflegerRouter.delete("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    if (req.role !== "a" || req.pflegerId === id)
        res.sendStatus(403);
    try {
        const del = yield (0, PflegerService_1.deletePfleger)(id);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
exports.pflegerRouter.post("/", authentication_1.requiresAuthentication, (0, express_validator_1.body)("name").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("admin").optional().isBoolean(), (0, express_validator_1.body)("password").isString().isLength({ min: 1, max: 100 }).isStrongPassword(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const pfleger = (0, express_validator_1.matchedData)(req);
    const role = req.role;
    if (role !== "a") {
        res.sendStatus(403);
    }
    try {
        const create = yield (0, PflegerService_1.createPfleger)(pfleger);
        res.status(201).send(create);
    }
    catch (error) {
        const e = error;
        if (e.message.startsWith("E11000 duplicate key error collection:"))
            res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Pfleger with that name already in DB!",
                        path: "name",
                        value: pfleger.name
                    }]
            });
        res.sendStatus(400);
        next(error);
    }
}));
exports.pflegerRouter.put("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("name").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("admin").isBoolean(), (0, express_validator_1.body)("password").optional().isString().isLength({ min: 1, max: 100 }).isStrongPassword(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    const pflegerData = (0, express_validator_1.matchedData)(req);
    if (id !== pflegerData.id) {
        res.status(400).send({
            errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
        });
        return;
    }
    const role = req.role;
    if (role !== "a") {
        res.sendStatus(403);
    }
    try {
        const update = yield (0, PflegerService_1.updatePfleger)(pflegerData);
        res.send(update);
    }
    catch (error) {
        const e = error;
        if (e.message.startsWith("E11000 duplicate key error collection:"))
            res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Pfleger with that name already in DB!",
                        path: "name",
                        value: pflegerData.name
                    }]
            });
        res.status(404);
        next(error);
    }
}));
//# sourceMappingURL=pfleger.js.map