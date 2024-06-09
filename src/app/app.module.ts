import {NgModule } from '@angular/core';
import {BrowserModule } from '@angular/platform-browser';
import {AppComponent } from './app.component';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import {AngularFireFunctionsModule, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/functions';
import {environment} from '../environments/environment';

import {AngularFireModule} from '@angular/fire';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {ReactiveFormsModule} from '@angular/forms';
import {HomeComponent} from './home/home.component';
import {AboutComponent} from './about/about.component';


import {LoginComponent} from './login/login.component';
import {RegistrarComponent} from './registrar/registrar.component';
import {EquiposCardListComponent} from './equipos-card-list/equipos-card-list.component';
import {AppRoutingModule} from './app-routing.module';
import {MantenimientoComponent} from './mantenimiento/mantenimiento.component';
import {CreateEquipoComponent} from './create-equipo/create-equipo.component';
import { LogLista } from './logLista/logLista.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MatNativeDateModule} from '@angular/material/core';
import {EditEquipoDialogComponent} from './edit-equipo-dialog/edit-equipo-dialog.component';
import { AuthGuard } from './guards/auth.guard';
import { NumberArrayPipe } from './number-array.pipe';

import { CreateMantenimientoComponent } from './create-mantenimiento/create-mantenimiento.component';
import { EditMantenimientoDialogComponent } from './edit-mantenimiento/edit-mantenimiento.component';
import { FormsModule } from '@angular/forms';
import { SearchEquipoComponet } from './search-equipo/search-equipo.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { EditUsuariosComponent } from './edit-usuarios/edit-usuarios.component';
import { ReportesComponent } from './reportes/reportes.component';
import { DatePipe } from '@angular/common';
import { PortalesComponent } from './portales/portales.component';
import { EditPortalesComponent } from './edit-portales/edit.portales.component';
import { EditarUserDialogComponent } from './editar-user-dialog/editar-user-dialog.component';
import { DescargarExcelComponent } from './descargar-excel/descargar-excel.component';
import { EditarPortalDialogComponent } from './editar-portal-dialog/editar-portal-dialog.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ReportesAllComponent } from './reportes-all/reportes-all.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    MantenimientoComponent,
    EquiposCardListComponent,
    EditEquipoDialogComponent,
    EditMantenimientoDialogComponent,
    LoginComponent,
    RegistrarComponent,
    CreateEquipoComponent,
    CreateMantenimientoComponent,
    SearchEquipoComponet,
    LogLista,
    EditUsuariosComponent,
    ReportesComponent,
    PortalesComponent,
    EditPortalesComponent,
    EditarUserDialogComponent,
    NumberArrayPipe,
    DescargarExcelComponent,
    EditarPortalDialogComponent,
    ResetPasswordComponent,
    ReportesAllComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    FormsModule,
    NgxQRCodeModule,
    BrowserModule,
    NgxChartsModule 
  ],
  providers: [
    AuthGuard,
    DatePipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
