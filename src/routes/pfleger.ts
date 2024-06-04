import express from "express";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../services/PflegerService";
import { PflegerResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { requiresAuthentication } from "./authentication";

export const pflegerRouter = express.Router();

pflegerRouter.put("/alle", async (_req, res, _next) => {
    res.sendStatus(404);
})

pflegerRouter.delete("/alle", async (_req, res, _next) => {
    res.sendStatus(404);
})

pflegerRouter.get("/alle",
    requiresAuthentication,
    async (req, res, _next) => {
        const role = req.role;
        if(role==="a") {
            const get = await getAllePfleger();
            res.send(get);
        }
        res.sendStatus(403);
    }
)
    
pflegerRouter.delete("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params!.id;
        if(req.role !== "a" || req.pflegerId === id)
            res.sendStatus(403);
        try {
            const del = await deletePfleger(id);
            res.sendStatus(204);
        } catch (error) {
            res.status(404);
            next(error);
        }
    }
)
    
pflegerRouter.post("/",
    requiresAuthentication,
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("admin").optional().isBoolean(),
    body("password").isString().isLength({ min: 1, max: 100 }).isStrongPassword(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pfleger = matchedData(req) as PflegerResource;
        const role = req.role;
        if (role !== "a") {
            res.sendStatus(403);
        }
        try {
            const create = await createPfleger(pfleger);
            res.status(201).send(create);
        } catch (error) {
            const e = error as Error;
            if (e.message.startsWith("E11000 duplicate key error collection:"))
                res.status(400).send({
                    errors: [{
                        location: "body",
                        msg: "Pfleger with that name already in DB!",
                        path: "name",
                        value: pfleger.name
                    }]
                })
            res.sendStatus(400);
            next(error);
        }
    }
)

pflegerRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("admin").isBoolean(),
    body("password").optional().isString().isLength({ min: 1, max: 100 }).isStrongPassword(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({ errors: errors.array()});
        }
        const id = req.params!.id;
        const pflegerData = matchedData(req) as PflegerResource;
        if (id !== pflegerData.id) {
            res.status(400).send({
                errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
            });
            return;
        }
        const role = req.role;
        if(role!=="a"){
            res.sendStatus(403);
        }
        try {
            const update = await updatePfleger(pflegerData);
            res.send(update);
        } catch (error) {
            const e = error as Error;
            if(e.message.startsWith("E11000 duplicate key error collection:")) 
            res.status(400).send({
                errors: [{
                    location : "body",
                    msg : "Pfleger with that name already in DB!",
                    path : "name",
                    value: pflegerData.name
                }]
            })
            res.status(404);
            next(error);
        }
    }
)