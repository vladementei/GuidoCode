import {Directive, OnDestroy} from "@angular/core";
import {Subject} from "rxjs";

@Directive()
export abstract class RxUnsubscribe implements OnDestroy {

  destroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
