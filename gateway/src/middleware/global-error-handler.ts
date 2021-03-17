import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers";

@Middleware({type: "after"})
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: () => any) {
        response.statusCode = error.httpCode;
        response.send({error: error});
        next();
    }
}
