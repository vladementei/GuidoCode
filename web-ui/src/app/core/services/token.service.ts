import {Injectable} from "@angular/core";
import {RxUnsubscribe} from "./rx-unsubscribe";
import {Token} from "../../models/token.model";

@Injectable()
export class TokenService extends RxUnsubscribe {

  private token: Token;

  constructor() {
    super();
    const tokenKey = "token=";
    const token = document.cookie.split(";")?.find(cookie => cookie.startsWith(tokenKey))?.replace(tokenKey, "");
    if (token) {
      this.token = {
        accessToken: token
      }
      sessionStorage.setItem("token", JSON.stringify(this.token));
    }
  }

  public getToken(): Token {
    let self = this;
    if (self.token === undefined || self.token.accessToken === "") {
      self.token = JSON.parse(sessionStorage.getItem("token")) || undefined;
    }
    return self.token;
  }

  public deleteToken(): void {
    console.log("deleting token");
    this.token = undefined;
    sessionStorage.removeItem("token");
  }
}
