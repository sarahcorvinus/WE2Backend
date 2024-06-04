"use strict";
/* istanbul ignore file */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // read ".env"
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./logger");
const promises_1 = require("fs/promises");
const https_1 = __importDefault(require("https"));
const prefill_1 = require("./prefill");
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        let mongodURI = process.env.DB_CONNECTION_STRING;
        if (!mongodURI) {
            logger_1.logger.error(`Cannot start, no database configured. Set environment variable DB_CONNECTION_STRING. Use "memory" for MongoMemoryServer`);
            process.exit(1);
        }
        if (mongodURI === "memory") {
            logger_1.logger.info("Start MongoMemoryServer");
            const MMS = yield Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            const mongo = yield MMS.MongoMemoryServer.create();
            mongodURI = mongo.getUri();
        }
        logger_1.logger.info(`Connect to mongod at ${mongodURI}`);
        yield mongoose_1.default.connect(mongodURI);
        if (process.env.DB_PREFILL === "true")
            yield (0, prefill_1.prefillDB)();
        const shouldSSL = process.env.USE_SSL === "true";
        if (shouldSSL) {
            const [privateKey, publicSSLCert] = yield Promise.all([
                (0, promises_1.readFile)(process.env.SSL_KEY_FILE),
                (0, promises_1.readFile)(process.env.SSL_CRT_FILE)
            ]);
            const httpsServer = https_1.default.createServer({ key: privateKey, cert: publicSSLCert }, app_1.default);
            const HTTPS_PORT = parseInt(process.env.HTTPS_PORT);
            httpsServer.listen(HTTPS_PORT, () => {
                console.log(`Listening for HTTPS at https://localhost:${HTTPS_PORT}`);
            });
        }
        else {
            const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000;
            const httpServer = http_1.default.createServer(app_1.default);
            httpServer.listen(port, () => {
                logger_1.logger.info(`Listening for HTTP at http://localhost:${port}`);
            });
        }
    });
}
;
setup();
//# sourceMappingURL=index.js.map