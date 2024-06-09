import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { UsuariosService } from '../services/usuarios.service';
import { Mantenimiento } from '../model/mantenimiento';
import Swal from 'sweetalert2';
import { MantenimientosService } from '../services/service.mantenimiento';
import { switchMap, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Equipo } from '../model/equipo';

@Component({
    selector: 'edit-mantenimiento',
    templateUrl: './edit-mantenimiento.component.html',
    styleUrls: ['./edit-mantenimiento.component.css']
})
export class EditMantenimientoDialogComponent implements OnInit, OnDestroy {

    form: FormGroup;
    mantenimiento: Mantenimiento;
    nombreUsuario: string;
    equipo: Equipo;

    nombreUserSubscription: Subscription;

    constructor(
        private dialogRef: MatDialogRef<EditMantenimientoDialogComponent>,
        private fb: FormBuilder,
        private authService: UsuariosService,
        @Inject(MAT_DIALOG_DATA) data: any, 
        private mantenimientosService: MantenimientosService
    ) {
        this.mantenimiento = data.mantenimiento; // Accede a mantenimiento desde data
        this.equipo = data.equipo; // Accede a equipo desde data
        this.form = this.fb.group({
            nombre: [this.mantenimiento.nombre, Validators.required],
            cedula: [this.mantenimiento.cedula, Validators.required],
            telefono: [this.mantenimiento.telefono, Validators.required],
            descripcion: [this.mantenimiento.descripcion, Validators.required],
            fechaInicio: [this.mantenimiento.fechaInicio, Validators.required],
            fechaFinal: [this.mantenimiento.fechaFinal, Validators.required],
            tMantenimiento: [this.mantenimiento.tMantenimiento, Validators.required]
        });
    }

    ngOnInit() {
        this.nombreUserSubscription = this.authService.nameUserLogged().pipe(
            take(1)
        ).subscribe(nombre => {
            this.nombreUsuario = nombre;
        });
    }

    ngOnDestroy() {
        if (this.nombreUserSubscription) {
            this.nombreUserSubscription.unsubscribe();
        }
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

    save() {
        const changes = this.form.value;

        this.mantenimientosService.updateMantenimiento(this.mantenimiento.eid, this.mantenimiento.id, changes)
            .pipe(
                switchMap(() => {
                    const data = {
                        equipoId: this.mantenimiento.codigo,
                        fecha: new Date().toLocaleDateString(),
                        hora: new Date().toLocaleTimeString(),
                        nombre: this.nombreUsuario,
                        codigo: this.equipo.codigo,
                        dispositivo: this.equipo.tipoDispositivo,
                        serie: this.equipo.serie
                    };

                    return this.mantenimientosService.createRegistroM(data);
                })
            )
            .subscribe(
                (docRef) => {
                    Swal.fire({
                        title: 'Mantenimiento actualizado',
                        text: `Codigo: ${this.mantenimiento.codigo}`,
                        icon: 'success',
                        showConfirmButton: true
                    }).then((result) => {
                        this.dialogRef.close(changes);
                    });
                },
                (error) => {
                    console.error('Error al crear el registro:', error);
                    // Manejo de errores si es necesario
                }
            );
    }
}
