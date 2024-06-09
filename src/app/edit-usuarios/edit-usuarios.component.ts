import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsuariosService } from '../services/usuarios.service';
import { Usuarios } from '../model/usuarios';
import { EditarUserDialogComponent } from '../editar-user-dialog/editar-user-dialog.component';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Subscription  } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-usuarios',
  templateUrl: './edit-usuarios.component.html',
  styleUrls: ['./edit-usuarios.component.scss']
})
export class EditUsuariosComponent implements OnInit {
  usuarios: Usuarios[] = [];
  listaCompletaUsuarios: Usuarios[] = [];
  loading = false;
  consulta = '';
  displayedColumns = ['nombre', 'email', 'rol', 'portal', 'acciones'];
  eliminarSubscription: Subscription;

  constructor(
    private usuariosService: UsuariosService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  ngOnDestroy() {
    if (this.eliminarSubscription) {
      this.eliminarSubscription.unsubscribe();
    }
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuariosService.obtenerUsuarios().pipe(
      tap(usuarios => {
        this.usuarios = usuarios.map(usuario => ({
          ...usuario,
          color: usuario.rol === 'Coordinador' ? 'lightgray' : '',
          eliminable: usuario.rol !== 'Guia Tic'
        }));
        this.listaCompletaUsuarios = [...this.usuarios];
      }),
      catchError(error => {
        console.error('Error al cargar usuarios:', error);
        return throwError(error);
      }),
      tap(() => this.loading = false)
    ).subscribe();
  }

  buscarUsuarios() {
    if (!this.consulta.trim()) {
      this.mostrarTodos();
      return;
    }
    this.loading = true;
    this.usuarios = this.listaCompletaUsuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(this.consulta.toLowerCase())
    );
    this.loading = false;
  }

  eliminarUsuario(usuario: Usuarios) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar al usuario ${usuario.email}. Esta acción no se puede revertir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.usuariosService.eliminarUsuarioTabla(usuario.email).pipe(
          tap(() => {
            this.cargarUsuarios();
            Swal.fire({
              title: '¡Usuario eliminado!',
              text: `El usuario ${usuario.email} ha sido eliminado exitosamente.`,
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }),
          catchError(error => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al eliminar el usuario. Por favor, inténtalo de nuevo.',
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
    this.usuarios = this.listaCompletaUsuarios;
    this.consulta = '';
  }

  editarUsuario(usuario: Usuarios) {
    const dialogRef = this.dialog.open(EditarUserDialogComponent, {
      width: '300px',
      data: { ...usuario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.usuariosService.actualizarUsuario(result.email, {
        nombre: result.nombre,
        rol: result.rol,
        portal: result.portal
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