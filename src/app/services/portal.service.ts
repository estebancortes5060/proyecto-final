import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { combineLatest } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";
import { Portal } from '../model/portal';
import {from, Observable, of, throwError, forkJoin} from "rxjs";
import { switchMap } from 'rxjs/operators';
import { catchError, concatMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class PortalService {

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
  ) { }

  getPortales(): Observable<any[]> {
    return this.firestore.collection('portales').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          const salas = data.salas || 0; // Si no existe el atributo salas, asigna 0
          return { id, ...data, salas };
        });
      })
    );
  }


  async createPortal(portal) {
    try {
      // Verificar si ya existe un portal con el mismo nombre
      const querySnapshot = await this.firestore.collection('portales').ref.where('nombrePortal', '==', portal.nombre).get();
      if (!querySnapshot.empty) {
        // Si ya existe un portal con el mismo nombre, mostrar un mensaje de error
        Swal.fire({
          title: 'Error',
          text: `Ya existe un portal con el nombre ${portal.nombre}`,
          icon: 'error',
          showConfirmButton: true,
        });
        return; // Detener la creación del portal
      }
  
      // Si no hay ningún portal con el mismo nombre, agregar el nuevo portal
      const portalRef = await this.firestore.collection('portales').add({
        nombrePortal: portal.nombre,
        direccion: portal.direccion,
        localidad: portal.localidad,
        barrio: portal.barrio,
        salas: portal.salas
      });
  
      // Mostrar un mensaje de éxito
      Swal.fire({
        title: '¡Portal y salas agregados!',
        text: `El portal ${portal.nombre} y sus ${portal.salas} salas han sido agregados exitosamente.`,
        icon: 'success',
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/main']);
        }
      });
    } catch (error) {
      console.error('Error al agregar portal y salas: ', error);
      throw error;
    }
  }
  

  obtenerPortales(): Observable<Portal[]> {
    // Utiliza la colección 'users' de Firebase para obtener los usuarios
    return this.firestore.collection<Portal>('portales').valueChanges();
  }

  eliminarPortalTabla(portal: string): Observable<void> {
    return this.firestore.collection<any>('equipos', ref => ref.where('portalCategoria', '==', portal)).snapshotChanges().pipe(
      switchMap(actions => {
        const deleteOperations: Observable<void>[] = actions.map(action => {
          const equipoDoc = action.payload.doc;
          const mantenimientosRef = equipoDoc.ref.collection('mantenimientos');
          return from(mantenimientosRef.get().then(mantenimientosSnapshot => {
            const deleteMantenimientosOperations: Promise<void>[] = [];
            mantenimientosSnapshot.forEach(doc => {
              deleteMantenimientosOperations.push(doc.ref.delete());
            });
            return Promise.all(deleteMantenimientosOperations).then(() => {
              return equipoDoc.ref.delete();
            });
          }));
        });
        return deleteOperations.length > 0 ? forkJoin(deleteOperations) : of(undefined);
      }),
      catchError(error => {
        console.error('Error al eliminar equipos:', error);
        return of(undefined);
      }),
      switchMap(deleteOperations => {
        if (!deleteOperations) {
          const portalesCollection = this.firestore.collection<any>('portales', ref => ref.where('nombrePortal', '==', portal));
          return portalesCollection.snapshotChanges().pipe(
            switchMap(actions => {
              if (actions.length > 0) {
                const portalDoc = actions[0].payload.doc;
                return from(this.firestore.collection('portales').doc(portalDoc.id).delete());
              } else {
                return of(undefined);
              }
            })
          );
        } else {
          return of(deleteOperations).pipe(
            switchMap(deleteOperations => {
              return deleteOperations.length > 0 ? of(deleteOperations) : of(undefined);
            })
          );
        }
      })
    );
  }


  
  actualizarPortal(nombre: string, changes: Partial<Portal>): Observable<any> {
    
    return this.firestore.collection<Portal>('portales', ref => ref.where('nombrePortal', '==', nombre)).get().pipe(
      catchError(error => {
        console.error('Error al buscar el usuario por correo electrónico:', error);
        return throwError(error);
      }),
      concatMap(snapshot => {
        if (snapshot.empty) {
          return throwError('No se encontró ningún usuario con el correo electrónico proporcionado');
        }
        const docId = snapshot.docs[0].id; 
        return from(this.firestore.doc(`portales/${docId}`).update(changes));
      }),
      catchError(error => {
        console.error('Error al actualizar el usuario:', error);
        return throwError(error);
      })
    );
  }
  

  obtenerUno(): Observable<any[]> {
    return this.firestore.collection('portales').valueChanges().pipe(
      map((portales: any[]) => {
        return portales.map(portal => {
          return {
            name: portal.nombrePortal,
            value: portal.salas
          };
        });
      })
    );
  }

}

