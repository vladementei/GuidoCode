import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable, Subject, throwError} from "rxjs";
import {catchError, takeUntil} from "rxjs/operators";
import {TokenService} from "../core/services/token.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private tokenService: TokenService) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.endsWith("/logout")) {
      return next.handle(this.addAuthenticationHeader(req))
        .pipe(
          takeUntil(this.unsubscribe$),
          catchError((err: any, caught: Observable<HttpEvent<any>>) => {
            if (err instanceof HttpErrorResponse) {
              if (this.checkIfTokenHasBeenExpired(err)) {
                this.tokenService.deleteToken();
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                sessionStorage.clear();
                this.unsubscribe$.next();
                return throwError(err);
              } else {
                return throwError(err);
              }
            }
            return caught;
          })
        );
    } else {
      return next.handle(req);
    }
  }

  private addAuthenticationHeader(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenService.getToken();

    if (token && token.accessToken !== "" && req.url) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token.accessToken}`
        }
      });
    }

    return req;
  }

  private checkIfTokenHasBeenExpired(err: HttpErrorResponse): boolean {
    return err && (err.status === 401 || err.status === 0);
  }
}
