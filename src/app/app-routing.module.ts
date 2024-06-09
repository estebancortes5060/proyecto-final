import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { LoginComponent } from './login/login.component';
import { CreateEquipoComponent } from './create-equipo/create-equipo.component';
import { CreateMantenimientoComponent } from './create-mantenimiento/create-mantenimiento.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { EquipoResolver } from './services/equipo.resolver';
import { SearchEquipoComponet } from './search-equipo/search-equipo.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { LogLista } from './logLista/logLista.component';
import { EditUsuariosComponent } from './edit-usuarios/edit-usuarios.component';
import { ReportesComponent } from './reportes/reportes.component';
import { ReportesAllComponent } from './reportes-all/reportes-all.component';
import { PortalesComponent } from './portales/portales.component';
import { EditPortalesComponent } from './edit-portales/edit.portales.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EquiposCardListComponent } from './equipos-card-list/equipos-card-list.component';



const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    path: 'main',
    component: HomeComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'cards',
    component: EquiposCardListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'create-equipo',
    component: CreateEquipoComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'create-mantenimiento',
    component: CreateMantenimientoComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'search-equipo',
    component: SearchEquipoComponet,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'reportes-all',
    component: ReportesAllComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'mantenimiento/:equipoUrl',
    component: CreateMantenimientoComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    resolve: {
      equipo: EquipoResolver
    }
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'logLista',
    component: LogLista,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'portal',
    component: PortalesComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'portales',
    component: EditPortalesComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'usuarios',
    component: EditUsuariosComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'registrar',
    component: RegistrarComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'equipos/:equipoUrl',
    component: MantenimientoComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    resolve: {
      equipo: EquipoResolver
    }
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }