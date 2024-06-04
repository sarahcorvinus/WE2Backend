import express from "express";
import { createEintrag, deleteEintrag, getEintrag, updateEintrag } from "../services/EintragService";
import { EintragResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getProtokoll } from "../services/ProtokollService";

export const eintragRouter = express.Router();

eintragRouter.get("/:id",
    optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() });
        }
        const id = req.params!.id;
        try {
            const get = await getEintrag(id);
            const prot = await getProtokoll(get.protokoll);
            if(!prot.public) {
                if(get.ersteller !== req.pflegerId && prot.ersteller !== req.pflegerId)
                    res.sendStatus(403);
            }
            res.send(get);
        } catch (error) {
            res.sendStatus(404);
            // next(error);
        }
    }
)

eintragRouter.post("/",
    requiresAuthentication,
    body("getraenk").isString().isLength({ min: 1, max: 100 }),
    body("menge").isNumeric().isInt({min: 1, max: 2000}),
    body("kommentar").optional().isString().isLength({ min: 1, max: 1000 }),
    body("ersteller").isMongoId(),
    body("protokoll").isMongoId(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() });
            return;
        }
        const entry = matchedData(req) as EintragResource;
        try {
            const prot = await getProtokoll(entry.protokoll);
            if(!prot.public && req.pflegerId !== prot.ersteller)
                res.sendStatus(403);
            
            const create = await createEintrag(entry);
            res.status(201).send(create);
        } catch (error) {
            res.status(400);
            next(error);
        }
    }
)

eintragRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("getraenk").isString().isLength({ min: 1, max: 100 }),
    body("menge").isNumeric().isInt({min: 1, max: 2000}),
    body("kommentar").optional().isString().isLength({ min: 1, max: 1000 }),
    body("ersteller").isMongoId(),
    body("protokoll").isMongoId(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() });
            return;
        }
        const entryData = matchedData(req) as EintragResource;
        const id = req.params!.id;

        if (id !== entryData.id) {
            res.status(400).send({
                errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
            });
            return;
        }
        try {
            const prot = await getProtokoll(entryData.protokoll);
            if(req.pflegerId !== entryData.ersteller && req.pflegerId !== prot.ersteller)
                res.sendStatus(403);
            const update = await updateEintrag(entryData);
            res.status(200).send(update);
        } catch (error) {
            res.status(404);
            next(error);
        }
    }
)

eintragRouter.delete("/:id",
    requiresAuthentication,
    param("id").isMongoId(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        const id = req.params!.id;
        try {
            const entry = await getEintrag(id);
            const prot = await getProtokoll(entry.protokoll);
            if(req.pflegerId !== entry.ersteller && req.pflegerId !== prot.ersteller)
                res.sendStatus(403);
            await deleteEintrag(id);
            res.sendStatus(204);
        } catch (error) {
            res.status(404);
            next(error);
        }
    }
)