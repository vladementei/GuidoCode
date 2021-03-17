import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {AnimationComponent} from './animation.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '', component: AnimationComponent,
  },
  {
    path: '**', component: AnimationComponent
  }
];

@NgModule({
  declarations: [AnimationComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
})
export class AnimationModule {

}
