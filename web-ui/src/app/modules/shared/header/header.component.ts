import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RxUnsubscribe} from '../../../core/services/rx-unsubscribe';
import {Router} from '@angular/router';
import {RoutingConstants} from '../../../constants/routing.constants';
import {Store} from "@ngxs/store";
import {Logout} from "../../../core/state/root.actions";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent extends RxUnsubscribe {

  constructor(private router: Router,
              private store: Store) {
    super();
  }

  navigateHome() {
    this.router.navigate([RoutingConstants.MAIN]);
  }

  logout() {
    this.store.dispatch(new Logout());
  }
}
