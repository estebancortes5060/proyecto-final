import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Usuarios } from '../model/usuarios';
import { UsuariosService } from '../services/usuarios.service';
import { PortalService } from '../services/portal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-user-dialog',
  templateUrl: './editar-user-dialog.component.html',
  styleUrls: ['./editar-user-dialog.component.css']
})
export class EditarUserDialogComponent implements OnInit {
  form: FormGroup;
  usuario: Usuarios;
  portales: any[];

  constructor(
    private dialogRef: MatDialogRef<EditarUserDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) usuario: Usuarios,
    private usuariosService: UsuariosService,
    private portalService: PortalService
  ) {
    this.usuario = { ...usuario };
    this.form = this.fb.group({
      nombre: [usuario.nombre, Validators.required],
      email: [usuario.email, [Validators.required, Validators.email]],
      portal: [usuario.portal, Validators.required],
    });
  }

  ngOnInit() {
    this.portalService.getPortales().subscribe(portales => {
      this.portales = portales;
    });

    this.form.valueChanges.subscribe(() => {
      if (this.form.invalid) {
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.form.valid) {
      const cambios = this.form.value;
      this.usuariosService.actualizarUsuario(this.usuario.email, cambios).subscribe(
        () => {
          this.dialogRef.close(this.usuario);
          Swal.fire('Usuario actualizado', `Nombre: ${this.usuario.nombre}`, 'success');
        },
        error => {
          console.error('Error al actualizar el usuario:', error);
          Swal.fire('Error al actualizar', 'Ha ocurrido un error al actualizar el usuario', 'error');
        }
      );
    } else {
      Swal.fire('Error', 'Por favor completa todos los campos correctamente', 'error');
    }
  }
}
