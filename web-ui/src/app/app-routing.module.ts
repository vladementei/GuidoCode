import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RoutingConstants} from './constants/routing.constants';

const routes: Routes = [
  {
    path: RoutingConstants.MAIN,
    loadChildren: () => import('./modules/main/main.module').then(module => module.MainModule),
    pathMatch: 'full'
  },
  {
    path: RoutingConstants.UPLOADING,
    loadChildren: () => import('./modules/uploading/uploading.module').then(module => module.UploadingModule)
  },
  {
    path: RoutingConstants.ANIMATION,
    loadChildren: () => import('./modules/animation/animation.module').then(module => module.AnimationModule)
  },
  {
    path: '**',
    loadChildren: () => import('./modules/main/main.module').then(module => module.MainModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
