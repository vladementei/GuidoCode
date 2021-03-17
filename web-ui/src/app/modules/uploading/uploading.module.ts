import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {UploadingComponent} from './uploading.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '', component: UploadingComponent,
  },
  {
    path: '**', component: UploadingComponent
  }
];

@NgModule({
  declarations: [UploadingComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
})
export class UploadingModule {

}
