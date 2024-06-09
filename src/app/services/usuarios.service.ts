import { Injectable } from "@angular/core";
import { from, Observable, of, throwError } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import { concatMap, map, switchMap, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import 'firebase/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { Usuarios } from '../model/usuarios';
import { catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocumentChangeAction } from '@angular/fire/firestore';

@Injectable({
  providedIn: "root"
})

export class UsuariosService {

  usuarioCambiadoSubject: Subject<any> = new Subject<any>();

  private timer: any;

  excelDownloading: boolean = false;
  usuarioActual: any;
  private autoLogoutTimer: any;

  private usuarioActualSubject = new BehaviorSubject<string | null>(null);
  usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router) {
  }



  async registrarUsuario(usuario: any) {
    try {
      if (usuario && usuario.email) {
        const querySnapshot = await this.firestore.collection('users', ref => ref.where('email', '==', usuario.email)).get().toPromise();
  
        if (querySnapshot.size > 0) {
          // El usuario ya está registrado, muestra un mensaje de error y redirige a iniciar sesión
        } else {
          await this.registrarAuth(usuario);

          Swal.fire({
            title: '¡Usuario registrado!',
            text: 'Por favor, inicie sesión para corroborar que el usuario ha sido creado exitosamente.',
            icon: 'success',
            showConfirmButton: true,
          });

          this.logout();   
        }
      }
    } catch (error) {
      Swal.fire({
        title: '¡Usuario ya registrado!',
        text: 'Por favor, cree un nuevo usuario.',
        icon: 'error',
        showConfirmButton: true,
      });    
      throw error;
    }
  }

  async registrarAuth(usuario) {
    try {
      const credenciales = await this.afAuth.createUserWithEmailAndPassword(usuario.email, usuario.contraseña);
      const { uid } = credenciales.user;
      
      await this.firestore.collection('users').doc(uid).set({
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        contraseña: usuario.contraseña,
        portal: usuario.portal
      });
  
      return credenciales.user;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, contraseña: string) {
    try {
      const querySnapshot = await this.firestore.collection('users', ref => ref.where('email', '==', email).where('contraseña', '==', contraseña)).get().toPromise();

      if (querySnapshot.size === 0) {
        // El usuario no existe en Firestore, agregar la 
        Swal.fire({
          title: 'ERROR',
          text: 'Su correo electrónico y su contraseña no coinciden.',
          icon: 'error'
        })
      } else {
        this.afAuth.signInWithEmailAndPassword(email, contraseña);
        this.firestore.collection('users', ref => ref.where('email', '==', email)).get().subscribe((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const nombre = doc.get('nombre');
            const rol = doc.get('rol');

            Swal.fire({
              title: '¡Bienvenido a INFOSTOCK!',
              text: `${nombre} está ingresando como ${rol}`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/main']);
                this.startTimeout();
              }
            });
          });
        });

      }
    } catch (err) {
      console.log("error en login: ", err);
      return null;
    }
  }

  obtenerUsuarios(): Observable<Usuarios[]> {
    // Utiliza la colección 'users' de Firebase para obtener los usuarios
    return this.firestore.collection<Usuarios>('users').valueChanges();
  }


  eliminarUsuarioTabla(email: string): Observable<void> {
    const usuariosCollection = this.firestore.collection<any>('users', ref => ref.where('email', '==', email));

    return usuariosCollection.snapshotChanges().pipe(
      switchMap(actions => {
        if (actions.length > 0) {
          const usuario = actions[0];
          return this.firestore.collection('users').doc(usuario.payload.doc.id).delete();
        } else {
          // Si no hay usuarios, puedes devolver un Observable vacío
          return of(undefined);
        }
      })
    );
  }


  getUserLogged() {
    return this.afAuth.authState;
  }


  getUserRol(): Observable<{ rol: string, nombre: string, portal: string }> {
    return this.afAuth.authState.pipe(
      switchMap(usuario => {
        if (usuario) {
          return this.firestore.collection('users', ref => ref.where('email', '==', usuario.email)).get();
        } else {
          // Devuelve un observable vacío si el usuario no está autenticado
          return [];
        }
      }),
      switchMap(querySnapshot => {
        if (querySnapshot.docs.length > 0) {
          const doc = querySnapshot.docs[0];
          const rol = doc.get('rol');
          const nombre = doc.get('nombre');
          const portal = doc.get('portal');
          return of({ rol: rol ? rol.toString() : '', nombre: nombre ? nombre.toString() : '', portal: portal ? portal.toString() : '' });
        } else {
          // Devuelve un observable vacío si no se encuentra el documento
          return of({ rol: '', nombre: '', portal: '' });
        }
      })
    );
  }


  nameUserLogged(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users', ref => ref.where('email', '==', user.email)).get();
        } else {
          // Si el usuario no está autenticado, devuelve un observable de valor nulo
          return of(null);
        }
      }),
      switchMap(querySnapshot => {
        if (querySnapshot && querySnapshot.docs && querySnapshot.docs.length > 0) {
          const doc = querySnapshot.docs[0];
          const nombre = doc.get('nombre');
          // Devuelve el nombre del usuario como observable
          return of(nombre ? nombre.toString() : '');
        } else {
          // Si no se encuentra el documento en Firestore, devuelve un observable de valor nulo
          return of(null);
        }
      })
    );
  }

  private startTimeout() {
    this.clearTimeout();

    this.timer = setTimeout(() => {
      this.logout(); 
    }, 5 * 60 * 1000); 
  }

  private clearTimeout() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resetTimeout() {
    this.startTimeout();
  }

  logout() {
    this.afAuth.signOut();
    this.clearTimeout();
    this.router.navigateByUrl('/login');
  }

  actualizarUsuario(email: string, changes: Partial<Usuarios>): Observable<any> {
    // Realizar una consulta para obtener el documento que coincide con el correo electrónico

    return this.firestore.collection<Usuarios>('users', ref => ref.where('email', '==', email)).get().pipe(
      catchError(error => {
        console.error('Error al buscar el usuario por correo electrónico:', error);
        return throwError(error);
      }),
      // Una vez que se obtiene el documento, actualizarlo
      concatMap(snapshot => {
        if (snapshot.empty) {
          return throwError('No se encontró ningún usuario con el correo electrónico proporcionado');
        }
        const docId = snapshot.docs[0].id; // Obtener el ID del primer documento que coincide con el correo electrónico
        return from(this.firestore.doc(`users/${docId}`).update(changes));
      }),
      catchError(error => {
        console.error('Error al actualizar el usuario:', error);
        return throwError(error);
      })
    );
  }


  updateUserPassword(email: string, newPassword: string): Observable<void> {
    return this.firestore.collection('users', ref => ref.where('email', '==', email)).get().pipe(
      catchError(error => {
        console.error('Error al buscar el usuario por correo electrónico:', error);
        return throwError(error);
      }),
      concatMap(snapshot => {
        if (snapshot.empty) {
          return throwError('No se encontró ningún usuario con el correo electrónico proporcionado');
        }
        const docId = snapshot.docs[0].id; // Obtener el ID del primer documento que coincide con el correo electrónico
        return from(this.firestore.doc(`users/${docId}`).update({ contraseña: newPassword }));
      }),
      catchError(error => {
        console.error('Error al actualizar la contraseña del usuario:', error);
        return throwError(error);
      })
    );
  }

}
