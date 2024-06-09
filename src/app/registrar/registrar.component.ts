import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { UsuariosService } from '../services/usuarios.service';
import { PortalService } from '../services/portal.service';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.scss']
})
export class RegistrarComponent implements OnInit, OnDestroy {
  formulario: FormGroup;
  portales: any[];
  selectedPortal: any; 
  private unsubscribe$: Subject<void> = new Subject<void>();
  private seleccionarTodos: boolean = false;

  constructor(
    private portalService: PortalService,
    private fb: FormBuilder,
    private userService: UsuariosService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\W).*$/)]],
      rol: [''],
      selectPortales: [''] 
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Método para cargar portales cuando se selecciona un rol
  cargarPortales() {
    const rol = this.formulario.value.rol;
    if (rol === 'Guia Tic') {
      this.portalService.getPortales()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(portales => {
          this.portales = portales;
        });
    } else {
      this.portales = []; // Limpiar portales si el rol no requiere cargar portales
    }
  }

  // Método para registrar usuario
  registrarUser() {
    const usuario: any = {
      nombre: this.formulario.value.nombre,
      email: this.formulario.value.email,
      contraseña: this.formulario.value.contraseña,
      portal: this.seleccionarTodos ? 'all' : this.formulario.value.selectPortales,
      rol: this.formulario.value.rol
    };
  
    this.userService.registrarUsuario(usuario)
      .then(() => {
        // Acciones después de registrar el usuario
      })
      .catch(error => {
        console.log(error);
      });
  }
}
