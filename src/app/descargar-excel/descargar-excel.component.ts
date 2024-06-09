import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as XLSX from 'xlsx';
import { EquiposService } from '../services/service.equipo';
import { UsuariosService } from '../services/usuarios.service';
import { Subscription, Subject } from 'rxjs';
import { take, finalize, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-descargar-excel',
  templateUrl: './descargar-excel.component.html',
  styleUrls: ['./descargar-excel.component.css']
})
export class DescargarExcelComponent implements OnDestroy {
  @Output() downloadClicked: EventEmitter<void> = new EventEmitter<void>();

  rol: string;
  userportal: string;
  isDownloading: boolean = false;
  private hasSubscribed: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();
  

  constructor(
    private equiposService: EquiposService,
    private user: UsuariosService
  ) {
    this.user.getUserRol().pipe(
      take(1) 
    ).subscribe(usuario => {
      this.rol = usuario.rol;
      this.userportal = usuario.portal;
    });
  }

  obtenerFechaActual() {
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1;
    const año = fechaActual.getFullYear();
    const fechaFormateada = `${dia < 10 ? '0' : ''}${dia}-${mes < 10 ? '0' : ''}${mes}-${año}`;
    return fechaFormateada;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  downloadExcel() {
    if (this.isDownloading || this.hasSubscribed) {
      return;
    }
    this.isDownloading = true; 
    Swal.fire({
      title: 'Descargar archivo Excel',
      text: '¿Estás seguro de que deseas descargar el archivo Excel con la información de los equipos?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, descargarlo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.hasSubscribed = true; 
        const downloadSubscription = (this.rol === 'Guia Tic') ?
          this.equiposService.loadEquiposByPortal(this.userportal).pipe(take(1)) :
          this.equiposService.loadAllEquipos().pipe(take(1));

        downloadSubscription.pipe(
          takeUntil(this.unsubscribe$), 
        ).subscribe(
          equipos => {
            console.log('Datos de equipos descargados:', equipos);
            this.convertToExcelAndDownload(equipos);
          },
          error => {
            console.error('Error al cargar equipos:', error);
          },
          () => {
            this.isDownloading = false; 
          }
        );
      } else {
        this.isDownloading = false; 
      }
    });
  }

  
  
  

  convertToExcelAndDownload(equipos: any[]) {
    const sheetName = 'Equipos_' + this.rol + '_' + this.obtenerFechaActual();

    const jsonData = equipos;
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = `${sheetName}.xlsx`;
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
 