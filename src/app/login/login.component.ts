import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { UsuariosService } from '../services/usuarios.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  formulario: FormGroup;
  resetPasswordSuccess = false;

  constructor(
    private fb: FormBuilder,
    private userService: UsuariosService,
    private afAuth: AngularFireAuth,
    private router : Router
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  async loginUser() {
    if (this.formulario.valid) {
      const email = this.formulario.get('email')?.value;
      const contraseña = this.formulario.get('contraseña')?.value;

      try {
        await this.userService.login(email, contraseña);
      } catch (error) {
        console.error('Error de autenticación:', error.message);
      }
    }
  }

  ngOnInit() {

  }
}





