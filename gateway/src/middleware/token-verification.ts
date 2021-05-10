import jwt from "jsonwebtoken";
import {AppRoutes} from "../constants";
import {HttpError} from "routing-controllers";
import {Role} from "../model/role";


export let jwtConfig = {
    pk: ""
};

export const tokenVerificationGuard = (acceptedRoles?: Role[]) => {
    return (request: any, response: any, next?: (err?: any) => any): any => {
        if (jwtConfig.pk && !request.headers.referer?.endsWith(`${AppRoutes.API_DOCS}/`)) {
            try {
                const legit: any = jwt.verify(request.headers.authorization?.replace("Bearer ", ""), jwtConfig.pk);
                if (!acceptedRoles || acceptedRoles.includes(legit.role)) {
                    next?.();
                    return;
                }
            } catch (e) {
                throw new HttpError(401, "Authorize first");
            }
            throw new HttpError(401, "You don't have an access");
        }
        next?.();
    }
}
