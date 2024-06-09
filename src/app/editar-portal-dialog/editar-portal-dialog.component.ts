import { Injectable, Inject } from '@angular/core';

import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Portal } from '../model/portal';
import { PortalService } from '../services/portal.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-portal-dialog',
  templateUrl: './editar-portal-dialog.component.html',
  styleUrls: ['./editar-portal-dialog.component.css']
})
export class EditarPortalDialogComponent implements OnInit {

  form: FormGroup;
  portales: Portal;

  constructor(
    private dialogRef: MatDialogRef<EditarPortalDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) portales: Portal,
    private portalService: PortalService
  ) {
    this.portales = { ...portales };
    this.form = this.fb.group({
      localidad: [portales.localidad, Validators.required],
      barrio: [portales.barrio, [Validators.required]],
      direccion: [portales.direccion, Validators.required],
      salas: [portales.salas, Validators.required],
    });
  }

  ngOnInit() {;
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
      this.portalService.actualizarPortal(this.portales.nombrePortal, cambios).subscribe(
        () => {
          this.dialogRef.close(this.portales);
          Swal.fire('Portal actualizado', `Nombre: ${this.portales.nombrePortal}`, 'success');
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
