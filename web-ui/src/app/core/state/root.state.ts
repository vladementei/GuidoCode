import {Action, NgxsOnInit, State, StateContext, Store} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {Logout, SendImage, SetEmbedded} from './root.actions';
import {RestService} from '../services/rest-service.service';
import {finalize, take} from 'rxjs/operators';
import {FileService} from '../services/file.service';

export interface RootStateModel {
  isUploadingLoader: boolean;
  isEmbedded: boolean;
}

export const defaultRootState: RootStateModel = {
  isUploadingLoader: false,
  isEmbedded: false,
}

@State<RootStateModel>({
  name: 'root',
  defaults: defaultRootState,
  children: []
})
@Injectable()
export class RootState implements NgxsOnInit {

  constructor(private store: Store,
              private restService: RestService,
              private fileService: FileService) {
  }

  ngxsOnInit(ctx?: StateContext<string | null>): any {
    //add callbacks and request
  }

  @Action(SendImage)
  sendImage(ctx: StateContext<RootStateModel>, action: SendImage): void {
    if (!ctx.getState().isUploadingLoader) {
      ctx.patchState({isUploadingLoader: true});
      this.restService.sendImage(action.file)
        .pipe(
          take(1),
          finalize(() => {
            ctx.patchState({isUploadingLoader: false});
          }))
        .subscribe((response) => this.fileService.downloadFile(response, action.file.name?.slice(0, -4)));
    }
  }

  @Action(SetEmbedded)
  setEmbedded(ctx: StateContext<RootStateModel>, action: SetEmbedded): void {
    if (ctx.getState().isEmbedded !== !!action.isEmbedded) {
      ctx.patchState({isEmbedded: !!action.isEmbedded});
    }
  }

  @Action(Logout)
  logout(): void {
    this.restService.logout()
      .pipe(take(1))
      .subscribe(loginPage => {
        document.getElementsByTagName("html")[0].innerHTML = loginPage
          .slice(loginPage.indexOf("<head>"))
          .replace("</html>", "");
      });
  }
}
