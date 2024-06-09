import {Component, OnInit, HostListener} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {from, Observable} from 'rxjs';
import {concatMap, filter, map} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import { UsuariosService } from './services/usuarios.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  usuarioAutenticado: boolean;
  rol : string;
  portal : string;
  photoUrl : string;

  constructor(private user: UsuariosService, private router : Router,) {

  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.user.resetTimeout(); // Reiniciar temporizador en movimiento del mouse
  }

  ngOnInit() {
      this.user.getUserLogged().subscribe(user => {
        this.usuarioAutenticado = !!user;
        this.photoUrl = user?.photoURL;

        this.user.usuarioCambiadoSubject.next();

      });

      this.user.getUserRol().subscribe(usuario => {
        this.rol = usuario.rol;
        this.portal = usuario.portal;

        this.user.usuarioCambiadoSubject.next();

      });
      

  }

  logged(){
    this.user.getUserLogged();
  }  

  redirigirAMain() {
    this.router.navigate(['/main']);
  }

  pictureUrl() {

  }

  logout() {
      this.user.logout();
  }

}
