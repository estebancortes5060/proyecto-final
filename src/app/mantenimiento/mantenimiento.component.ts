import { Equipo } from '../model/equipo';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Mantenimiento } from '../model/mantenimiento';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { EquiposService } from '../services/service.equipo';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditMantenimientoDialogComponent } from '../edit-mantenimiento/edit-mantenimiento.component';
import { MantenimientosService } from '../services/service.mantenimiento';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { AngularFireAuth } from '@angular/fire/auth';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'mantenimiento',
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css']
})
export class MantenimientoComponent implements OnInit, OnDestroy {
  @Output() mantenimientoEdited = new EventEmitter();
  @Output() mantenimientoDeleted = new EventEmitter<Mantenimiento>();
  consulta: string = '';
  equipo: Equipo;
  nombre: string;
  rol: string;
  mantenimientos: Mantenimiento[];
  mostrarListarEquipos: boolean = false;
  mostrarVerMas: boolean = true;
  loading = false;
  lastPageLoaded = 0;
  displayedColumns = ['nombre', 'cedula', 'telefono', 'tMantenimiento', 'descripcion', 'fechaInicio', 'fechaFinal', 'acciones'];
  nombreUsuario: string;
  portal: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute,
    private mantenimientosService: MantenimientosService,
    private dialog: MatDialog,
    private location: Location,
    private authService: UsuariosService,
    private afAuth: AngularFireAuth) {
  }

  ngOnInit() {
    this.equipo = this.route.snapshot.data["equipo"];
    this.loading = true;
    this.mantenimientosService.findMantenimientos(this.equipo.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.loading = false)
      )
      .subscribe(
        mantenimientos => this.mantenimientos = mantenimientos
      );

    this.authService.getUserRol().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(usuario => {
      this.nombre = usuario.nombre;
      this.rol = usuario.rol;
      this.portal = usuario.portal;
    });

    this.authService.nameUserLogged().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(nombre => {
      this.nombreUsuario = nombre;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMore() {
    this.lastPageLoaded++;
    this.loading = true;
    this.mantenimientosService.findMantenimientos(this.equipo.id, "asc", this.lastPageLoaded)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.loading = false)
      )
      .subscribe(mantenimientos => this.mantenimientos = this.mantenimientos.concat(mantenimientos));
  }

  editMantenimineto(equipo: Equipo, mantenimiento: Mantenimiento) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = "400px";
    dialogConfig.data = { equipo: equipo, mantenimiento: mantenimiento };

    this.dialog.open(EditMantenimientoDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(val => {
        if (val) {
          this.mantenimientoEdited.emit();
          this.mantenimientosService.findMantenimientos2(this.equipo.id)
            .pipe(
              takeUntil(this.unsubscribe$),
              finalize(() => this.loading = false)
            )
            .subscribe(
              equipos => {
                this.mantenimientos = [];
                this.mantenimientosService.findMantenimientos(this.equipo.id)
                  .subscribe(
                    mantenimientos => this.mantenimientos = mantenimientos
                  );
              }
            );
        }
      });
  }

  confirmDelete(equipo: Equipo, mantenimiento: Mantenimiento) {
    Swal.fire({
      title: '¿Estás seguro de Eliminar?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.onDeleteMantenimiento(equipo, mantenimiento);
      }
    });
  }

  onDeleteMantenimiento(equipo: Equipo, mantenimiento: Mantenimiento) {
    const data = {
      equipoId: mantenimiento.codigo,
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
      nombre: this.nombreUsuario,
      codigo: this.equipo.codigo,
      dispositivo: this.equipo.tipoDispositivo,
      serie: this.equipo.serie
    };
    this.mantenimientosService.createRegistroMD(data).then(
      (docRef) => {
        console.log('Registro log creado con ID:', docRef.id);
      },
      (error) => {
        console.error('Error al crear el log registro:', error);
      }
    );
    this.mantenimientosService.deleteMantenimiento(equipo.id, mantenimiento.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => {
          console.log("deleted equipo", mantenimiento);
          this.mantenimientoDeleted.emit(mantenimiento);
          Swal.fire('Equipo Eliminado', `Serie: ${equipo.serie}`, 'success');
          window.location.reload();
        }),
        catchError(err => {
          console.log(err);
          alert("no se pudo eliminar");
          return throwError(err);
        })
      )
      .subscribe();
  }

  buscarMantenimiento(equipo: Equipo) {
    this.mantenimientosService
      .buscarMantenimientos(equipo.id, this.consulta)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((mantenimientos) => {
        if (mantenimientos.length > 0) {
          const mantenimientoEncontrado = mantenimientos[0];
          console.log('Mantenimiento encontrado:', mantenimientoEncontrado);
          this.mantenimientos = mantenimientos;
        } else {
          console.log('No se encontraron mantenimientos con ese nombre.');
        }
      });
    this.consulta = '';
    this.mostrarListarEquipos = true;
    this.mostrarVerMas = false;
  }

  listarTodosEquipos() {
    this.loading = true;
    this.mantenimientosService.findMantenimientos2(this.equipo.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.loading = false)
      )
      .subscribe(
        equipos => {
          this.mantenimientos = [];
          this.mantenimientosService.findMantenimientos(this.equipo.id)
            .subscribe(
              mantenimientos => this.mantenimientos = mantenimientos
            );
        }
      );
    this.mostrarListarEquipos = false;
    this.mostrarVerMas = true;
  }

  volverPaginaAnterior() {
    this.location.back();
  }
}