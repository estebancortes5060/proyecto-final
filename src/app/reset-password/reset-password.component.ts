import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import Swal from 'sweetalert2';
import { Observable, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import 'firebase/auth';
import { catchError } from 'rxjs/operators';



@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  formulario: FormGroup;
  resetPasswordSuccess = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private userService: UsuariosService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\W).*$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ notEqual: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  resetPassword() {
    if (this.formulario.valid) {
      const email = this.formulario.get('email')?.value;
      const newPassword = this.formulario.get('newPassword')?.value;
  
      this.updateUserPasswordInDatabase(email, newPassword);
    }
  }
  
  updateUserPasswordInDatabase(email: string, newPassword: string) {
    this.userService.updateUserPassword(email, newPassword)
      .subscribe(() => {
        // Lógica para mostrar un mensaje de éxito
        this.resetPasswordSuccess = true;
  
        // Envía el correo de restablecimiento de contraseña
        this.sendResetPasswordEmail(email).catch(() => {
          // Lógica para mostrar un mensaje de error
        });
      }, error => {
        // Lógica para mostrar un mensaje de error
      });
  }

  // Función para enviar el correo de restablecimiento de contraseña
  sendResetPasswordEmail(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email).then(() => {
      console.log('Correo electrónico de restablecimiento de contraseña enviado.');
    }).catch(error => {
      console.error('Error al enviar el correo electrónico de restablecimiento de contraseña:', error);
      throw new Error('Error al enviar el correo electrónico de restablecimiento de contraseña');
    });

  }

  ngOnInit(): void {
  }

}
