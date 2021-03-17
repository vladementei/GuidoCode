import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RxUnsubscribe} from '../../../core/services/rx-unsubscribe';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent extends RxUnsubscribe {

  constructor() {
    super();
  }
}
