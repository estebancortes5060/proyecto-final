import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { from, Observable, of, throwError } from "rxjs";
import { Equipo } from "../model/equipo";
import { concatMap, map, switchMap, tap } from "rxjs/operators";
import { convertSnaps } from "./db-utils";
import { Mantenimiento } from "../model/mantenimiento";
import { ColumnMappingService } from './column-mapping.service';
import { catchError } from 'rxjs/operators';
import * as QRCode from 'qrcode';
import firebase from "firebase";
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';




import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
    providedIn: "root"
})
export class EquiposService {


    constructor(
        private db: AngularFirestore,
        private columnMappingService: ColumnMappingService) {
    }

    findEquipoByUrl(equipoUrl: string): Observable<Equipo | null> {
        let codigo = parseInt(equipoUrl);
        return this.db.collection("equipos",
            ref => ref.where("codigo", "==", codigo))
            .get()
            .pipe(
                map(results => {

                    const equipos = convertSnaps<Equipo>(results);

                    return equipos.length == 1 ? equipos[0] : null;
                })
            );
    }
    /*findEquipoByCodigo(codigo: number): Observable<{ id: string, equipo: Equipo } | null> {
        return this.db.collection("equipos",
            ref => ref.where("codigo", "==", codigo))
            .get()
            .pipe(
                map(snapshot => {
                    const equipos = convertSnaps<Equipo>(snapshot);
                    if (equipos.length === 1) {
                        const id = snapshot.docs[0].id;
                        return { id, equipo: equipos[0] };
                    } else {
                        return null;
                    }
                })
            );
    }*/
    deleteCourseAndLessons(equipoId: string) {
        return this.db.collection(`equipos/${equipoId}/mantenimiento`)
            .get()
            .pipe(
                concatMap(results => {

                    const mantenimientos = convertSnaps<Mantenimiento>(results);

                    const batch = this.db.firestore.batch();

                    const equipoRef = this.db.doc(`equipos/${equipoId}`).ref;

                    batch.delete(equipoRef);

                    for (let mantenimiento of mantenimientos) {
                        const mantenimientoRef =
                            this.db.doc(`equipos/${equipoId}/mantenimiento/${mantenimiento.id}`).ref;

                        batch.delete(mantenimientoRef);
                    }

                    return from(batch.commit());

                })
            );
    }

    deleteEquipo(equipoId: string) {
        return from(this.db.doc(`equipos/${equipoId}`).delete());
    }
    updateEquipo(equipoId: string, changes: Partial<Equipo>): Observable<any> {
        return from(this.db.doc(`equipos/${equipoId}`).update(changes));
    }

    createEquipo(newEquipo: Partial<Equipo>, equipoId?: string): Observable<any> {
        const serieExistsQuery = this.db.collection("equipos", ref => ref.where("serie", "==", newEquipo.serie)).get();

        return serieExistsQuery.pipe(
            concatMap(snapshot => {
                if (!snapshot.empty) {
                    const errorMessage = `Ya existe un equipo con la serie ${newEquipo.serie}`;
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage
                    });
                    return throwError(errorMessage);
                }

                return this.db.collection("equipos", ref => ref.orderBy("codigo", "desc").limit(1)).get().pipe(
                    concatMap(result => {
                        const equipos = convertSnaps<Equipo>(result);
                        const lastEquipoCodigo = equipos[0]?.codigo ?? 0;
                        const equipo = {
                            ...newEquipo,
                            codigo: lastEquipoCodigo + 1
                        };
                        let save$: Observable<any>;
                        if (equipoId) {
                            save$ = from(this.db.doc(`equipos/${equipoId}`).set(equipo));
                        } else {
                            save$ = from(this.db.collection("equipos").add(equipo));
                        }
                        return save$.pipe(
                            map(res => ({
                                id: equipoId ?? res.id,
                                ...equipo
                            }))
                        );
                    })
                );
            }),
            catchError(error => {
                // Manejo de errores
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al crear equipo'
                });
                return throwError(error);
            })
        );
    }


    loadEquiposByCategory(categoria: string, sala: number): Observable<Equipo[]> {
        return this.db.collection<Equipo>('equipos', ref =>
            ref.where('portalCategoria', '==', categoria)
                .where('sala', '==', sala)
                .orderBy('codigo')
        ).snapshotChanges().pipe(
            map(actions => {
                return actions.map(action => {
                    const data = action.payload.doc.data() as Equipo;
                    const id = action.payload.doc.id;
                    return { id, ...data };
                });
            })
        );
    }


    buscarEquipos(codigo): Observable<any[]> {
        const equiposRef = this.db.collection(`equipos`, (ref) =>
            ref.where('serie', '==', codigo)
        );
        return equiposRef.snapshotChanges().pipe(
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

    buscarEquiposP(codigo, portal): Observable<any[]> {
        const equiposRef = this.db.collection('equipos', ref =>
            ref.where('serie', '==', codigo)
                .where('portalCategoria', '==', portal)
        );

        return equiposRef.snapshotChanges().pipe(
            map(snapshots => {
                return snapshots.map(snapshot => {
                    const id = snapshot.payload.doc.id;
                    const data = snapshot.payload.doc.data();
                    const mergedData = typeof data === 'object' ? { id, ...data } : { id };
                    return mergedData;
                });
            })

        );
    }

    createRegistroCE(data: any) {
        return this.db.collection('registrosCE').add(data); // Crear
    }

    createRegistroE(data: any) {
        return this.db.collection('registrosE').add(data); // EDITO 
    }

    createRegistroD(data: any) {
        return this.db.collection('registrosD').add(data); // ELIMINO
    }

    saveQRCodeToFirebase(qrCodeUrl: string, equipoId: string): void {
        const equiposRef = this.db.collection('/equipos');

        // Utiliza el ID del equipo para establecer el documento
        const equipoDocRef = equiposRef.doc(equipoId);

        // Agrega o actualiza el campo qrCodeUrl en el documento del equipo
        equipoDocRef.set({ url: qrCodeUrl }, { merge: true });
    }

    // Carga los equipos filtrados por el portal del usuario
    loadEquiposByPortal(userportal: string): Observable<any[]> {
        return this.db.collection('equipos', ref => ref.where('portalCategoria', '==', userportal)).snapshotChanges().pipe(
            map(changes => {
                return changes.map(a => {
                    const data = a.payload.doc.data() as any;
                    const mappedData = {};
                    Object.keys(data).forEach(key => {
                        if (key !== 'id' && key !== 'partes') { 
                            mappedData[this.columnMappingService.getMappedColumnName(key)] = data[key];
                        }
                    });
                    return mappedData;
                });
            })
        );
    }

    // Carga todos los equipos
    loadAllEquipos(): Observable<any[]> {
        return this.db.collection('equipos').snapshotChanges().pipe(
            map(changes => {
                return changes.map(a => {
                    const data = a.payload.doc.data() as any;
                    const mappedData = {};
                    Object.keys(data).forEach(key => {
                        if (key !== 'id' && key !== 'partes') { 
                            mappedData[this.columnMappingService.getMappedColumnName(key)] = data[key];
                        }
                    });
                    return mappedData;
                });
            })
        );
    }



    obtenerGuiaUno(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal);

                const conteoEquiposPorSala = equipos.reduce((acc, equipo) => {
                    const sala = equipo.sala;
                    acc[sala] = (acc[sala] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorSala).map(sala => ({ name: sala, value: conteoEquiposPorSala[sala] }));
            })
        );
    }

    obtenerGuiaDos(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal && equipo.tipoDispositivo === 'Escritorio');

                const conteoEquiposPorSala = equipos.reduce((acc, equipo) => {
                    const sala = equipo.sala;
                    acc[sala] = (acc[sala] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorSala).map(sala => ({ name: sala, value: conteoEquiposPorSala[sala] }));
            })
        );
    }

    obtenerGuiaTres(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal && equipo.tipoDispositivo === 'Portatil');

                const conteoEquiposPorSala = equipos.reduce((acc, equipo) => {
                    const sala = equipo.sala;
                    acc[sala] = (acc[sala] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorSala).map(sala => ({ name: sala, value: conteoEquiposPorSala[sala] }));
            })
        );
    }

    obtenerGuiaCuatro(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal && equipo.tipoDispositivo === 'Impresora');

                const conteoEquiposPorSala = equipos.reduce((acc, equipo) => {
                    const sala = equipo.sala;
                    acc[sala] = (acc[sala] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorSala).map(sala => ({ name: sala, value: conteoEquiposPorSala[sala] }));
            })
        );
    }

    obtenerGuiaCinco(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal && equipo.tipoDispositivo === 'Proyector');

                const conteoEquiposPorSala = equipos.reduce((acc, equipo) => {
                    const sala = equipo.sala;
                    acc[sala] = (acc[sala] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorSala).map(sala => ({ name: sala, value: conteoEquiposPorSala[sala] }));
            })
        );
    }

    obtenerGuiaSeis(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal);

                const conteoEquiposPorEstado = equipos.reduce((acc, equipo) => {
                    const estado = equipo.estado; // Suponiendo que el atributo que contiene el estado se llama "estado"
                    acc[estado] = (acc[estado] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorEstado).map(estado => ({ name: estado, value: conteoEquiposPorEstado[estado] }));
            })
        );
    }

    obtenerGuiaSiete(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal);

                const conteoEquiposPorTipoDispositivo = equipos.reduce((acc, equipo) => {
                    const tipoDispositivo = equipo.tipoDispositivo;
                    acc[tipoDispositivo] = (acc[tipoDispositivo] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorTipoDispositivo).map(tipoDispositivo => ({ name: tipoDispositivo, value: conteoEquiposPorTipoDispositivo[tipoDispositivo] }));
            })
        );
    }

    obtenerGuiaOcho(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal);

                const conteoEquiposPorSO = equipos.reduce((acc, equipo) => {
                    const so = equipo.sO; // Cambio aquí a "so" en lugar de "estado" si esa es la propiedad correcta
                    acc[so] = (acc[so] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorSO).map(so => ({ name: so, value: conteoEquiposPorSO[so] }));
            })
        );
    }

    obtenerGuiaNueve(portal: string) {
        return this.db.collection('equipos').valueChanges().pipe(
            map((equipos: any[]) => {
                equipos = equipos.filter(equipo => equipo.portalCategoria === portal);

                const conteoEquiposPorTipoConRed = equipos.reduce((acc, equipo) => {
                    const tipoConRed = equipo.tipoConRed; // Cambio aquí a "tipoConRed" en lugar de "estado" si esa es la propiedad correcta
                    acc[tipoConRed] = (acc[tipoConRed] || 0) + 1;
                    return acc;
                }, {});

                return Object.keys(conteoEquiposPorTipoConRed).map(tipoConRed => ({ name: tipoConRed, value: conteoEquiposPorTipoConRed[tipoConRed] }));
            })
        );
    }

    obtenerGuiaDiez(portal: string) {
        return this.db.collection('equipos').snapshotChanges().pipe(
            map(actions =>
                actions.map(action => {
                    const data = action.payload.doc.data();
                    const id = action.payload.doc.id;
                    return { id, ...data as object }; // Convertimos data a objeto
                })
            ),
            switchMap((equipos: any[]) => {
                const equiposFiltrados = equipos.filter(equipo => equipo.portalCategoria === portal);
                const observables = equiposFiltrados.map(equipo => {
                    const mantenimientosRef = this.db.collection('equipos').doc(equipo.id).collection('mantenimientos');
                    return mantenimientosRef.get().pipe(
                        switchMap(snapshot => {
                            if (snapshot.empty) {
                                return of({ name: equipo.serie, value: 0 });
                            } else {
                                return of({ name: equipo.serie, value: snapshot.size });
                            }
                        })
                    );
                });
                return forkJoin(observables);
            }),
        );
    }

    obtenerGuiaOnce(portal: string) {
        return this.db.collection('equipos').snapshotChanges().pipe(
            map(actions =>
                actions.map(action => {
                    const data = action.payload.doc.data();
                    const id = action.payload.doc.id;
                    return { id, ...data as object };
                })
            ),
            switchMap((equipos: any[]) => {
                const equiposFiltrados = equipos.filter(equipo => equipo.portalCategoria === portal);
                const observables = equiposFiltrados.map(equipo => {
                    const mantenimientosRef = this.db.collection('equipos').doc(equipo.id).collection('mantenimientos');
                    return mantenimientosRef.get().pipe(
                        switchMap(snapshot => {
                            if (snapshot.empty) {
                                return of({ name: equipo.sala, value: 0 });
                            } else {
                                return of({ name: equipo.sala, value: snapshot.size });
                            }
                        })
                    );
                });
                return forkJoin(observables);
            }),
        );
    }

    obtenerGuiaDoce(portal: string) {
        return this.db.collection('equipos').snapshotChanges().pipe(
            map(actions =>
                actions.map(action => {
                    const data = action.payload.doc.data();
                    const id = action.payload.doc.id;
                    return { id, ...data as object }; // Convertimos data a objeto
                })
            ),
            switchMap((equipos: any[]) => {
                const equiposFiltrados = equipos.filter(equipo => equipo.portalCategoria === portal);
                const observables = equiposFiltrados.map(equipo => {
                    const mantenimientosRef = this.db.collection('equipos').doc(equipo.id).collection('mantenimientos');
                    return mantenimientosRef.get().pipe(
                        switchMap(snapshot => {
                            if (snapshot.empty) {
                                return of({ name: equipo.tipoDispositivo, value: 0 });
                            } else {
                                return of({ name: equipo.tipoDispositivo, value: snapshot.size });
                            }
                        })
                    );
                });
                return forkJoin(observables);
            })
        );
    }



}
