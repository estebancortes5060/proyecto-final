import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { from, Observable, of, throwError } from "rxjs";
import { Equipo } from "../model/equipo";
import { concatMap, map, switchMap, tap } from "rxjs/operators";
import { convertSnaps } from "./db-utils";
import { Mantenimiento } from "../model/mantenimiento";

import firebase from "firebase";
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
  providedIn: "root"
})
export class MantenimientosService {
  [x: string]: any;
  constructor(private db: AngularFirestore) {
  }
  findMantenimientos(equipoId: string, sortOrder: OrderByDirection = 'asc',
    pageNumber = 0, pageSize = 3): Observable<Mantenimiento[]> {
    return this.db.collection(`equipos/${equipoId}/mantenimientos`,
      ref => ref.orderBy("codigo", sortOrder)
        .limit(pageSize)
        .startAfter(pageNumber * pageSize)
    )
      .get()
      .pipe(
        map(results => convertSnaps<Mantenimiento>(results))
      )
  }
  createMantenimiento(newMantenimiento: Partial<Mantenimiento>, mantenimientoId?: string, equipoId?: string): Observable<any> {
    return this.db.collection("equipos")
      .doc(equipoId)
      .collection("mantenimientos", ref => ref.orderBy("codigo", "desc").limit(1))
      .get()
      .pipe(
        concatMap(result => {
          const mantenimientos = convertSnaps<Mantenimiento>(result);
          const lastMantenimiento = mantenimientos[0];
          const lastMantenimientoCodigo = lastMantenimiento ? lastMantenimiento.codigo : 0;
          const nuevoCodigo = lastMantenimientoCodigo + 1;
          return from(
            this.db.collection("equipos")
              .doc(equipoId)
              .collection("mantenimientos")
              .add({ ...newMantenimiento, codigo: nuevoCodigo })
          ).pipe(
            map(res => {
              return {
                id: mantenimientoId ?? res.id,
                codigo: nuevoCodigo, // Nuevo código asignado
                ...newMantenimiento
              };
            })
          );
        })
      );
  }
  updateMantenimiento(eqId: string, mantenimientoId: string, changes: Partial<Mantenimiento>): Observable<any> {
    return from(this.db.doc(`equipos/${eqId}/mantenimientos/${mantenimientoId}`).update(changes));
  }
  deleteMantenimiento(eId: string, mantenimientoId: string) {
    return from(this.db.doc(`equipos/${eId}/mantenimientos/${mantenimientoId}`).delete());
  }
  buscarMantenimientos(idEquipo: string, nombre: string): Observable<any[]> {
    const mantenimientosRef = this.db.collection(`equipos/${idEquipo}/mantenimientos`, (ref) =>
      ref.where('nombre', '>=', nombre).where('nombre', '<=', nombre + '\uf8ff')
    );
  
    return mantenimientosRef.snapshotChanges().pipe(
      map((snapshots) => {
        return snapshots.map((snapshot) => {
          const id = snapshot.payload.doc.id;
          const data = snapshot.payload.doc.data();
          const mergedData = Object.assign({ id }, data);
          return mergedData;
        });
      })
    );
  }
  

  findMantenimientos2(equipoId: string, sortOrder: OrderByDirection = 'asc', pageNumber = 0, pageSize = 3): Observable<Mantenimiento[]> {
    return this.db.collection(`equipos/${equipoId}/mantenimientos`, ref =>
      ref.orderBy('codigo', sortOrder)
        .limit(pageSize)
        .startAfter(pageNumber * pageSize)
    )
      .get()
      .pipe(
        map(results => convertSnaps<Mantenimiento>(results))
      );
  }

  createRegistroCM(data: any) {
    return this.db.collection('registrosCM').add(data); // Crear
  }
  // Método para crear un nuevo registro en la colección "registros"
  createRegistroM(data: any) {
    return this.db.collection('registrosM').add(data); // QUIEN EDITO REGISTRO MANTENIMEINTO
  }
  createRegistroMD(data: any) {
    return this.db.collection('registrosMD').add(data); // QUIEN ELIMINO DE MANTENIMIENTO 
  }
}