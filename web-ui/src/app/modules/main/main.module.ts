import {NgModule} from '@angular/core';
import {MainComponent} from './main.component';
import {SharedModule} from '../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '', component: MainComponent,
  },
  {
    path: '**', component: MainComponent
  }
];

@NgModule({
  declarations: [MainComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
  exports: [MainComponent]
})
export class MainModule {

}
