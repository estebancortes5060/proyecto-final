import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Equipo} from "../model/equipo";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import {EditEquipoDialogComponent} from "../edit-equipo-dialog/edit-equipo-dialog.component";
import {catchError, tap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Router} from '@angular/router';
import { EquiposService } from '../services/service.equipo';
import Swal from 'sweetalert2';
import {AngularFireAuth} from '@angular/fire/auth';
import { UsuariosService } from '../services/usuarios.service';

@Component({
    selector: 'equipos-card-list',
    templateUrl: './equipos-card-list.component.html',
    styleUrls: ['./equipos-card-list.component.css']
})
export class EquiposCardListComponent implements OnInit {

    rol: string;
    portal: string;
    user: string;
    nombreUsuario: string;

    @Input()
    equipos: Equipo[];

    @Output()
    equipoEdited = new EventEmitter();

    @Output()
    equipoDeleted = new EventEmitter<Equipo>();

    constructor(
      private dialog: MatDialog,
      private router: Router,
      private equiposService:EquiposService,
      private authService: UsuariosService,
      private afAuth: AngularFireAuth) {
    }

    ngOnInit() {
      this.authService.getUserRol().subscribe(usuario => {
        this.rol = usuario.rol;
        this.portal = usuario.portal;
      });

      this.authService.nameUserLogged().subscribe(nombre => {
        this.nombreUsuario = nombre;
      })

    }

    editEquipo(equipo:Equipo) {

        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.minWidth = "400px";
        dialogConfig.data = equipo;

        this.dialog.open(EditEquipoDialogComponent, dialogConfig)
            .afterClosed()
            .subscribe(val => {
                if (val) {
                    this.equipoEdited.emit();
                }
            });

    }
    confirmDelete(equipo:Equipo) {
        Swal.fire({
          title: '¿Estás seguro de Eliminar?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, Eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.value) {
            this.onDeleteEquipo(equipo);
          }
        });
    }
    onDeleteEquipo(equipo:Equipo){
        const data = {
          equipoId: equipo.codigo,
          fecha: new Date().toLocaleDateString(),
          hora: new Date().toLocaleTimeString(),
          nombre: this.nombreUsuario,
          portal: equipo.portalCategoria,
          sala: equipo.sala,
          dispositivo: equipo.tipoDispositivo,
          serie: equipo.serie
          };

          
        this.equiposService.createRegistroD(data).then(
            (docRef) => {
              console.log('Registro log creado con ID:', docRef.id);
              console.log(this.nombreUsuario);
            },
            (error) => {
              console.error('Error al crear el log registro:', error);
              // Manejo de errores si es necesario
            }
          );
        this.equiposService.deleteCourseAndLessons(equipo.id)
            .pipe(
                tap(() => {
                    console.log("deleted equipo", equipo);
                    this.equipoDeleted.emit(equipo);
                    Swal.fire('Equipo Eliminado', `Serie: ${equipo.serie}`, 'success');
                }),
                catchError(err => {
                    console.log(err);
                    Swal.fire('Error al eliminar', 'Ha ocurrido un error al eliminar el registro', 'error');
                    return throwError(err);
                })
            )
            .subscribe();
    }


}








