import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Equipo } from "../model/equipo";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { EquiposService } from '../services/service.equipo';
import { AngularFireAuth } from '@angular/fire/auth';
import { UsuariosService } from '../services/usuarios.service';
import Swal from 'sweetalert2';
import { Registros } from '../model/registros';
import { PortalService } from '../services/portal.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';


@Component({
  selector: 'edit-equipo-dialog',
  templateUrl: './edit-equipo-dialog.component.html',
  styleUrls: ['./edit-equipo-dialog.component.css']
})
export class EditEquipoDialogComponent {
  form: FormGroup;
  equipo: Equipo;
  portales: any[];
  portal: string;
  rol: string;

  salasArray: number[] = [];
  nombreUsuario: string;



  userSubscription: Subscription;
  portalSubscription: Subscription;
  nombreUserSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<EditEquipoDialogComponent>,
    private fb: FormBuilder,
    private Portal: PortalService,
    @Inject(MAT_DIALOG_DATA) equipo: Equipo,
    private equiposService: EquiposService,
    private authService: UsuariosService
  ) {
    this.equipo = equipo;
    this.form = this.fb.group({
      modelo: [equipo.modelo, Validators.required],
      descripcion: [equipo.descripcion, Validators.required],
      estado: [equipo.estado],
      tipoConRed: [equipo.tipoConRed],
      sO: [equipo.sO],
      serie: [equipo.serie, Validators.required],
      sala: [equipo.sala]
    })
  }

  ngOnInit() {
    this.userSubscription = this.authService.getUserRol().pipe(
      take(1)
    ).subscribe(usuario => {
      this.rol = usuario.rol;
    });

    this.portalSubscription = this.Portal.getPortales().pipe(
      take(1)
    ).subscribe(portales => {
      this.portales = portales;
      this.getSelectedPortal();
      this.getSalasPortal();

    });

    this.nombreUserSubscription = this.authService.nameUserLogged().pipe(
      take(1)
    ).subscribe(nombre => {
      this.nombreUsuario = nombre;
    })

  }

  getSelectedPortal() {
    const selectedPortalName = this.equipo.portalCategoria;
    return this.portales.find(portal => portal.nombrePortal === selectedPortalName);
  }

  getSalasPortal() {
    const equipoPortal = this.getSelectedPortal();
    if (equipoPortal && equipoPortal.salas) {
      this.salasArray = Array.from({ length: equipoPortal.salas }, (_, i) => i + 1);
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.portalSubscription) {
      this.portalSubscription.unsubscribe();
    }
    if (this.nombreUserSubscription) {
      this.nombreUserSubscription.unsubscribe();
    }
  }

  save() {
    const changes = this.form.value;
    this.equiposService.updateEquipo(this.equipo.id, changes).subscribe(() => {
      const data = {
        equipoId: this.equipo.codigo,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        nombre: this.nombreUsuario,
        portal: this.equipo.portalCategoria,
        sala: this.equipo.sala,
        dispositivo: this.equipo.tipoDispositivo,
        serie: this.equipo.serie
      };

      this.equiposService.createRegistroE(data).then(
        (docRef) => {
        },
        (error) => {
        }
      );

      Swal.fire('Equipo actualizado', `Serie: ${this.equipo.serie}`, 'success');
      this.dialogRef.close(changes);
    }, error => {
      Swal.fire('Error al actualizar', 'Ha ocurrido un error al actualizar el registro', 'error');
    });
  }

  close() {
    this.dialogRef.close();
  }

  confirmSave() {
    Swal.fire({
      title: '¿Estás seguro de editar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.save();
      }
    });
  }

  resetCheckboxes() {
    // Restablece los valores de los checkboxes cuando cambia la selección
    this.form.patchValue({
      Maus: false,
      Teclado: false,
      Diadema: false,
      Parlantes: false,
      CPU: false,
      Monitor: false,
      Cargador: false
      // Restablece otros controles de checkbox aquí
    });
  }

}