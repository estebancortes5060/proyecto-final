import { Component } from '@angular/core';
import { RevisionesService } from '../services/revisiones.service';

@Component({
  selector: 'logLista',
  templateUrl: './logLista.component.html',
  styleUrls: ['./logLista.component.scss']
})
export class LogLista {

  selectedOption: string = ''; 
  mostrarEquiposFlag: boolean = false;
  mostrarMantenimientoFlag: boolean = false;
  registrosD: any[] = [];
  registrosE: any[] = [];
  registrosM: any[] = [];
  registrosMD: any[] = [];
  registrosCE: any[] = [];
  registrosCM: any[] = [];

  constructor(private revisionesService: RevisionesService) {}

  mostrarEquipos() {
    this.mostrarEquiposFlag = true;
    this.mostrarMantenimientoFlag = false;
    this.selectedOption = ''; 
    this.revisionesService.obtenerRegistrosCE().subscribe(data => {
      this.registrosCE = data;
    });
    this.revisionesService.obtenerRegistrosD().subscribe(data => {
      this.registrosD = data;
    });
    this.revisionesService.obtenerRegistrosE().subscribe(data => {
      this.registrosE = data;
    });
  }

  mostrarMantenimiento() {
    this.mostrarEquiposFlag = false;
    this.mostrarMantenimientoFlag = true;
    this.selectedOption = ''; 
    this.revisionesService.obtenerRegistrosCM().subscribe(data => {
      this.registrosCM = data;
    });
    this.revisionesService.obtenerRegistrosM().subscribe(data => {
      this.registrosM = data;
    });
    this.revisionesService.obtenerRegistrosMD().subscribe(data => {
      this.registrosMD = data;
    });
  }

}



