import dotenv from "dotenv";
import log4js from "log4js";
import bodyParser from "body-parser";
import {Request, Response} from "express-serve-static-core";
import {useExpressServer} from 'routing-controllers';
import {AuthorizationController} from "./controller";
import express, {Express} from "express";
import httpContext from "express-http-context";
import {GlobalErrorHandler} from "./middleware";
import {AppRoutes} from "./constants";
const keypair = require("keypair");
const fs = require("fs");

dotenv.config();
const logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL || "error";
const port = process.env.PORT || 3000;
if (process.env.UPDATE_KEY === "true") {
    const rsaPair = keypair();
    console.log(rsaPair);
    fs.writeFile("assets/private.key", rsaPair.private, () => {});
    fs.writeFile("assets/public.key", rsaPair.public, () => {});
}

const app: Express = express();
app.use(bodyParser.json())
app.use(httpContext.middleware);

useExpressServer(app, {
    controllers: [AuthorizationController],
    middlewares: [GlobalErrorHandler],
    defaultErrorHandler: false
});

app.use((req, res, next) => {
    httpContext.ns.bindEmitter(req);
    httpContext.ns.bindEmitter(res);
    next();
});

app.get(AppRoutes.ROOT, (req: Request, res: Response) => res.send("Welcome to idp server"));

app.listen(port, () => {
    logger.info(`⚡️[server]: IDP server is running at ${process.env.URL}:${port}`);
});
