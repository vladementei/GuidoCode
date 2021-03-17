import {Body, Controller, Get, HttpError, Post, UseBefore} from "routing-controllers"
import "reflect-metadata";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
const fs = require("fs");
import * as jwt from "jsonwebtoken";
import {SignOptions} from "jsonwebtoken";
import {User} from "../model";
import axios from "axios";


class AuthorizationRoutes {
    public static readonly PUBLIC_KEY = "public-key";
    public static readonly TOKEN = "token";
    public static readonly LOGIN = "login";
    public static readonly SIGN_UP = "sign-up";
}

const signOptions: SignOptions = {
    issuer: "GuidoCode corp",
    subject: "GuidoCode@gmail.com",
    audience: "http://localhost",
    expiresIn: "24h",
    algorithm: "RS256"
};

@Controller()
@UseBefore(removeCors)
export class AuthorizationController {
    @Get(`${AppRoutes.AUTHORIZATION}/${AuthorizationRoutes.PUBLIC_KEY}`)
    getPublicKey() {
        return new Promise((resolve, reject) => {
            fs.readFile("assets/public.key", "utf8", (err: NodeJS.ErrnoException, data: string) => {
                if (err) {
                    reject(new HttpError(400, err.message));
                    return;
                }
                resolve(data);
            });
        });
    }

    @Get(`${AppRoutes.AUTHORIZATION}/${AuthorizationRoutes.TOKEN}`)
    getToken() {
        const payload = {
            role: "Anonymous"
        };
        return this.generateToken(payload);
    }

    @Post(`${AppRoutes.AUTHORIZATION}/${AuthorizationRoutes.LOGIN}`)
    login(@Body() user: User) {
        return new Promise((resolve, reject) => {
            resolve(axios.get(`http://localhost:3000/users?username=${user.username}`)
                .then(response => {
                    if (response.data?.length && response.data[0].password === user.password) {
                        return this.generateToken(response.data[0]);
                    } else {
                        throw new HttpError(404, "Login failed");
                    }
                })
            );
        });
    }

    @Post(`${AppRoutes.AUTHORIZATION}/${AuthorizationRoutes.SIGN_UP}`)
    signUp(@Body() user: User) {
        return new Promise((resolve, reject) => {
            resolve(axios.post(`http://localhost:3000/users`, {...user, role: "user"})
                .then(response => {
                    if (response.status === 201) {
                        return this.generateToken(response.data);
                    } else {
                        throw new HttpError(404, "Sign-up failed");
                    }
                })
            );
        });
    }

    private generateToken(payload: object): Promise<unknown> {
        return new Promise((resolve, reject) => {
            fs.readFile("assets/private.key", "utf8", (err: NodeJS.ErrnoException, data: string) => {
                if (err) {
                    reject(new HttpError(400, err.message));
                    return;
                }
                const token = jwt.sign(payload, data, signOptions);
                resolve(token);
            });
        });
    }
}
