import dotenv from "dotenv";
import log4js from "log4js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import {Request, Response} from "express-serve-static-core";
import {useExpressServer} from 'routing-controllers';
import {ConverterController, NodesController, RecognitionController} from "./controller";
import express, {Express} from "express";
import httpContext from "express-http-context";
import {GlobalErrorHandler} from "./middleware";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from '../src/swagger/openapi.json';
import {AppRoutes} from "./constants";
import axios from "axios";
import {jwtConfig} from "./middleware/token-verification";


dotenv.config();
const logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL || "error";
const port = process.env.PORT || 3000;

const app: Express = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.use(fileUpload({createParentPath: true}));
app.use(bodyParser.json());
app.use(httpContext.middleware);
swaggerDocument.servers[0].url = process.env.URL + ":" + port;
app.use(AppRoutes.API_DOCS, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

useExpressServer(app, {
    controllers: [ConverterController, NodesController, RecognitionController],
    middlewares: [GlobalErrorHandler],
    defaultErrorHandler: false
});

app.use((req, res, next) => {
    httpContext.ns.bindEmitter(req);
    httpContext.ns.bindEmitter(res);
    next();
});

app.get(AppRoutes.ROOT, (req: Request, res: Response) => res.redirect(AppRoutes.API_DOCS));

axios.get(`http://localhost:8085/authorization/public-key`)
    .then((response) => {
        jwtConfig.pk = response.data;
    })
    .catch(() => logger.error("Validation token fetching failed"))
    .finally(() => {
        app.listen(port, () => {
            logger.info(`⚡️[server]: Server is running at ${process.env.URL}:${port}`);
        });
    })
