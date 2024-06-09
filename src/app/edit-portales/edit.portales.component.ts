import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PortalService } from '../services/portal.service';
import { Portal } from '../model/portal';
import { EditarPortalDialogComponent } from '../editar-portal-dialog/editar-portal-dialog.component';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Subscription  } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit.portales',
  templateUrl: './edit.portales.component.html',
  styleUrls: ['./edit.portales.component.scss']
})
export class EditPortalesComponent implements OnInit {
  portales: Portal[] = [];
  listaCompletaPortales: Portal[] = [];
  loading = false;
  consulta = '';
  displayedColumns = ['nombrePortal', 'salas', 'localidad', 'barrio', 'direccion', 'acciones'];
  eliminarSubscription: Subscription;

  constructor(
    private portalService: PortalService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarPortales();
  }

  ngOnDestroy() {
    if (this.eliminarSubscription) {
      this.eliminarSubscription.unsubscribe();
    }
  }

  cargarPortales() {
    this.loading = true;
    this.portalService.obtenerPortales().pipe(
      tap(portal => {
        this.portales = portal.map(usuario => ({
          ...usuario
        }));
        this.listaCompletaPortales = [...this.portales];
      }),
      catchError(error => {
        console.error('Error al cargar usuarios:', error);
        return throwError(error);
      }),
      tap(() => this.loading = false)
    ).subscribe();
  }


  buscarPortales() {
    if (!this.consulta.trim()) {
      this.mostrarTodos();
      return;
    }
    this.loading = true;
    this.portales = this.listaCompletaPortales.filter(portal =>
      portal.nombrePortal.toLowerCase().includes(this.consulta.toLowerCase())
    );
    this.loading = false;
  }

  eliminarPortal(portal: Portal) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar el portal ${portal.nombrePortal}. Esta acción no se puede revertir y también se eliminarán todos los equipos asociados a este portal.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.portalService.eliminarPortalTabla(portal.nombrePortal).pipe(
          tap(() => {
            this.cargarPortales();
            Swal.fire({
              title: '¡Portal eliminado!',
              text: `El portal ${portal.nombrePortal} y todos los equipos asociados han sido eliminados exitosamente.`,
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }),
          catchError(error => {
            console.error('Error al eliminar el portal:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al eliminar el portal. Por favor, inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return throwError(error);
          }),
          tap(() => this.loading = false)
        ).subscribe();
      }
    });
  }

  mostrarTodos() {
    this.portales = this.listaCompletaPortales;
    this.consulta = '';
  }

  editarPortal(portal: Portal) {
    const dialogRef = this.dialog.open(EditarPortalDialogComponent, {
      width: '300px',
      data: { ...portal }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.portalService.actualizarPortal(result.nombrePortal, {
        localidad: result.localidad,
        barrio: result.barrio,
        direccion: result.direccion,
        salas: result.salas
      }).pipe(
        tap(() => console.log('Usuario actualizado con éxito')),
        catchError(error => {
          console.error('Error al actualizar el usuario:', error);
          return throwError(error);
        })
      ).subscribe();
    });
  }

}
