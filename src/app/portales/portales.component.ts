import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as firebaseui from 'firebaseui';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import firebase from 'firebase/app';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../services/usuarios.service';
import { PortalService } from '../services/portal.service';

@Component({
  selector: 'app-portales',
  templateUrl: './portales.component.html',
  styleUrls: ['./portales.component.scss']
})

export class PortalesComponent implements OnInit {
  formulario : FormGroup;

  constructor(
    private Portal : PortalService,
    private fb: FormBuilder,
    private userService : UsuariosService,
    private afAuth: AngularFireAuth,
    private router: Router) {
      this.formulario = this.fb.group({
        nombre: ['', [Validators.required]],
        salas: ['', [Validators.required]],
        direccion: ['', [Validators.required]],
        localidad: ['', [Validators.required]],
        barrio: ['', [Validators.required]]
      });
  }

  ngOnInit(): void {
  }

  crearPortal(){

    const portal: any = {
      nombre: this.formulario.value.nombre,
      salas: this.formulario.value.salas,
      direccion: this.formulario.value.direccion,
      localidad: this.formulario.value.localidad,
      barrio: this.formulario.value.barrio
    }

    this.Portal.createPortal(portal).then(() =>{
    }).catch(error => {
      console.log(error)
    });

  }

}
