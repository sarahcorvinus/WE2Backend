"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors"); // needs to be imported before routers and other stuff!
const login_1 = require("./routes/login");
const eintrag_1 = require("./routes/eintrag");
const pfleger_1 = require("./routes/pfleger");
const protokoll_1 = require("./routes/protokoll");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const configCORS_1 = require("./configCORS");
const app = (0, express_1.default)();
(0, configCORS_1.configureCORS)(app);
// Middleware:
app.use('*', express_1.default.json()); // vgl. Folie 138
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/api/login", login_1.loginRouter); // wird erst später implementiert, hier nur Dummy; hat aber bereits einen Präfix
// TODO: Registrieren Sie hier die weiteren Router:
app.use("/api/protokoll", protokoll_1.protokollRouter);
app.use("/api/pfleger", pfleger_1.pflegerRouter);
app.use("/api/eintrag", eintrag_1.eintragRouter);
exports.default = app;
//# sourceMappingURL=app.js.map