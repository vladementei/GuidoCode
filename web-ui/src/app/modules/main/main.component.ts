import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RxUnsubscribe} from '../../core/services/rx-unsubscribe';
import {Router} from '@angular/router';
import {NavLink} from '../../models/nav-link.model';
import {NAV_LINKS} from '../../constants/navigation.constants';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent extends RxUnsubscribe {

  readonly NAV_LINKS = NAV_LINKS;

  constructor(private router: Router,) {
    super();
  }

  navigate(link: NavLink): void {
    if (link.href) {
      window.open(link.href, '_blank');
    } else if (link.route) {
      this.router.navigate([link.route]).catch(e => {
        //TODO routing to login
      });
    }
  }
}
