import log4js from "log4js";

const logger = log4js.getLogger();

export const removeCors = (request: any, response: any, next?: (err?: any) => any): any => {
    logger.info(`[${request.method}]: ${request.url}`);
    //httpContext.set('project', 'Notes recognition');
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    next?.();
}
