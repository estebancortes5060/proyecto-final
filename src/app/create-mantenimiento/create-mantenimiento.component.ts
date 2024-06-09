import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';
import { Mantenimiento } from '../model/mantenimiento';
import { Equipo } from '../model/equipo';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { MantenimientosService } from '../services/service.mantenimiento';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'create-mantenimiento',
  templateUrl: 'create-mantenimiento.component.html',
  styleUrls: ['create-mantenimiento.component.css']
})
export class CreateMantenimientoComponent implements OnInit, OnDestroy {
  rol: string;
  portal: string;
  mantenimientoId: string;
  equipo: Equipo;
  nombreU: string;
  form: FormGroup;
  userSubscription: Subscription;
  nombreUsuario: string;
  nombreUserSubscription: Subscription;


  constructor(
    private fb: FormBuilder,
    private user: UsuariosService,
    private mantenimientosService: MantenimientosService,
    private afs: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private location: Location
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
      telefono: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fin: [false],
      fechaFinal: [null],
      tMantenimiento: ['', Validators.required]
    });

    this.userSubscription = this.user.getUserRol().subscribe(usuario => {
      this.rol = usuario.rol;
      this.portal = usuario.portal;
      this.nombreU = usuario.nombre;
    });

    this.nombreUserSubscription = this.user.nameUserLogged().subscribe(nombre => {
      this.nombreUsuario = nombre;
  })

    this.mantenimientoId = this.afs.createId();
    this.equipo = this.route.snapshot.data["equipo"];
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.nombreUserSubscription) {
      this.nombreUserSubscription.unsubscribe();
  }
  }

  onCreateMantenimiento() {
    const val = this.form.value;

    const newMantenimiento: Partial<Mantenimiento> = {
      nombre: val.nombre,
      cedula: val.cedula,
      telefono: val.telefono,
      descripcion: val.descripcion,
      fin: val.fin,
      fechaInicio: val.fechaInicio,
      fechaFinal: val.fechaFinal,
      eid: this.equipo.id,
      tMantenimiento: [val.tMantenimiento]
    };

    this.mantenimientosService.createMantenimiento(newMantenimiento, this.mantenimientoId, this.equipo.id)
      .pipe(
        tap(mantenimiento => {

          const data = {
            equipoId: mantenimiento.codigo,
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
            nombre: this.nombreUsuario,
            codigo: this.equipo.codigo,
            dispositivo: this.equipo.tipoDispositivo,
            serie: this.equipo.serie
        };
          
          this.mantenimientosService.createRegistroCM(data).then(
            (docRef) => {
            },
            (error) => {
              console.error('Error al crear el registro:', error);
              // Manejo de errores si es necesario
            }
          );

          const numero = this.equipo.codigo;
          this.router.navigateByUrl(`/equipos/${numero}`);
          Swal.fire('Mantenimiento Registrado correctamente', `Codigo: ${mantenimiento.codigo}`, 'success');
        }),
        catchError(err => {
          console.log(err);
          alert("no se realizo registro.");
          return throwError(err);
        })
      )
      .subscribe();
  }

  volverPaginaAnterior() {
    this.location.back(); // Navega hacia atrás en el historial del navegador
  }

  fechaActual() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }
}