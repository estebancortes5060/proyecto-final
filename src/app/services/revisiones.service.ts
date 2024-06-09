import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import {Router} from "@angular/router";
import 'firebase/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RevisionesService {

  constructor (
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router){ 
}

obtenerRegistrosD(): Observable<any[]> {
  return this.firestore.collection('registrosD').valueChanges();
}

obtenerRegistrosE(): Observable<any[]> {
  return this.firestore.collection('registrosE').valueChanges();
}

obtenerRegistrosM(): Observable<any[]> {
  return this.firestore.collection('registrosM').valueChanges();
}

obtenerRegistrosMD(): Observable<any[]> {
  return this.firestore.collection('registrosMD').valueChanges();
}

obtenerRegistrosCE(): Observable<any[]> {
  return this.firestore.collection('registrosCE').valueChanges();
}

obtenerRegistrosCM(): Observable<any[]> {
  return this.firestore.collection('registrosCM').valueChanges();
}

}
