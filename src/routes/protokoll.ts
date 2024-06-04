import express from "express";
import { getAlleEintraege } from "../services/EintragService";
import { createProtokoll, deleteProtokoll, getAlleProtokolle, getProtokoll, updateProtokoll } from "../services/ProtokollService";
import { ProtokollResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { Protokoll } from "../model/ProtokollModel";

export const protokollRouter = express.Router();

protokollRouter.put("/alle", async (_req, res, _next) => {
    res.sendStatus(404);
})

protokollRouter.get("/:id/eintraege",
    optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        const id = req.params!.id;

        try {
            const prot = await getProtokoll(id);
            if(!prot.public && req.pflegerId !== prot.ersteller.toString()) {
                // if(req.pflegerId !== prot.ersteller.toString()) {
                    res.sendStatus(403);
                // }
            }
            const eintraege = await getAlleEintraege(id);
            res.send(eintraege); // 200 by default
        } catch (err) {
            res.status(404); // not found
            next(err);
        }
    }
)

protokollRouter.get("/alle", 
    optionalAuthentication,
    async (req, res, _next) => {
        const id = req.pflegerId;
        const prots = await getAlleProtokolle(id);
        res.send(prots);
})

protokollRouter.get("/:id",
    optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            const id = req.params!.id;
            const protokoll = await getProtokoll(id);
            if(protokoll.public)
                res.send(protokoll); // 200 by default
            if(id !== protokoll.ersteller.toString())
                res.sendStatus(403);
        
            res.send(protokoll);
        } catch (err) {
            res.status(404); // not found
            next(err);
        }
    }
)

protokollRouter.delete("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        try {
            const id = req.params!.id;
            const prot = await Protokoll.findById(id).exec();
            if(req.pflegerId !== prot!.ersteller.toString())
                res.sendStatus(403);
            await deleteProtokoll(id);
            res.sendStatus(204);
        } catch (err) {
            res.status(404);
            next(err);
        }
    }
)

/* HTTP POST: Meist zum Anlegen einer neuen Resource,
  diese wird vom Sender mitgeschickt */

/* HTTP PUT: Resource soll verändert werden, d.h. der bestehende
  Inhalt durch die mitgeschickte Repräsentation ersetzt werden. */

protokollRouter.post("/",
    requiresAuthentication,
    body("patient").isString().isLength({ min: 1, max: 100 }),
    body("datum").isDate({ format: "DD.MM.YYYY", delimiters: ["."] }),
    body("public").optional().isBoolean(),
    body("closed").optional().isBoolean(),
    body("ersteller").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const protData = matchedData(req) as ProtokollResource;

        if(protData.ersteller !== req.pflegerId)
            res.sendStatus(403);
        try {
            const createdProt = await createProtokoll(protData);
            res.status(201).send(createdProt);
        } catch (error) {
            const e = error as Error;
            if(e.message.startsWith("Seems there is no Pfleger with that id!"))
                res.status(400).send({errors: [{ location: "body", path: "ersteller", msg: "No Pfleger with that ID found!", value: protData.ersteller}]});
            res.status(400);
            next(error);
        }
    }
)


protokollRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("patient").isString().isLength({ min: 1, max: 100 }),
    body("datum").isDate({ format: "DD.MM.YYYY", delimiters: ["."] }),
    body("public").optional().isBoolean(),
    body("closed").optional().isBoolean(),
    body("ersteller").isMongoId(),

    async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params!.id;
        const protData = matchedData(req) as ProtokollResource;
        if (id !== protData.id) {
            res.status(400).send({
                errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
            });
            return;
        }
        try {
            // TODO maybe write custom validation error + tests for below
            const id = req.params!.id;
            const prot = await Protokoll.findById(id).exec();
            if(req.pflegerId !== prot!.ersteller.toString())
                res.sendStatus(403);
            const update = await updateProtokoll(protData);
            res.status(200).send(update);
        } catch (error) {
            res.status(404);
            next(error);
        }
    }
)
