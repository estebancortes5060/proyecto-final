import { DatePipe } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { NgZone, Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { UsuariosService } from '../services/usuarios.service';
import { EquiposService } from '../services/service.equipo';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PortalService } from '../services/portal.service';
import { ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes-all',
  templateUrl: './reportes-all.component.html',
  styleUrls: ['./reportes-all.component.css']
})
export class ReportesAllComponent implements OnInit {

  @ViewChild('reporte', { static: true }) reporte: ElementRef;


  rol: string;
  portal: string;
  datosGraficoUno: any[];
  datosGraficoDos: any[];
  datosGraficoTres: any[];
  datosGraficoCuatro: any[];
  datosGraficoCinco: any[];
  datosGraficoSeis: any[];
  datosGraficoSiete: any[];
  datosGraficoOcho: any[];
  datosGraficoNueve: any[];
  datosGraficoDiez: any[];
  datosGraficoOnce: any[];
  datosGraficoDoce: any[];
  datosGraficoTrece: any[];
  cGUno: any;
  cGDos: any;
  cGTres: any;
  cGCuatro: any;
  cGCinco: any;
  cGSeis: any;
  cGSiete: any;
  cGOcho: any;
  cGNueve: any;
  cGDiez: any;
  cGOnce: any;
  cGDoce: any;
  cGTrece: any;

  portales: any[];
  selectedOption: string;
  selectedOptionD: string;
  fecha: string;
  nombreArchivo: string;

  opcionSeleccionada: boolean = false;
  selectedOptionUno: string;

  view: any[] = [500, 300];
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string;
  showYAxisLabel: boolean = true;
  yAxisLabel: string;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private datePipe: DatePipe,
    private firestore: AngularFirestore,
    private zone: NgZone,
    private user: UsuariosService,
    private equiposService: EquiposService,
    private Portal: PortalService
  ) { }

  ngOnInit(): void {

    this.fecha = this.obtenerFechaActual();

    this.Portal.getPortales()
      .pipe(take(1))
      .subscribe(portales => {
        this.portales = portales;
      });

    this.user.getUserRol()
      .pipe(take(1))
      .subscribe(usuario => {
        this.rol = usuario.rol;
        this.portal = usuario.portal;

        if (this.rol && this.portal) {
          this.graficoUno();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  downloadPDF() {
    // Construye el nombre del archivo
    this.nombreArchivo = 'Reporte_' + this.rol + '_' + this.fecha;

    // Define las opciones para SweetAlert
    const swalOptions = {
      title: '¿Desea descargar el PDF del reporte?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, descargar',
      cancelButtonText: 'Cancelar',
    };

    // Muestra el SweetAlert de confirmación
    Swal.fire(swalOptions as any).then((result) => {
      // Si el usuario confirma, procede a descargar el PDF
      
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

  configurarOpcionesGrafico(view: any[], xAxisLabel: string, yAxisLabel: string) {
    return {
      view: view,
      showXAxis: this.showXAxis,
      showYAxis: this.showYAxis,
      gradient: this.gradient,
      showLegend: this.showLegend,
      showXAxisLabel: this.showXAxisLabel,
      showYAxisLabel: this.showYAxisLabel,
      xAxisLabel: xAxisLabel,
      yAxisLabel: yAxisLabel,
      colorScheme: this.colorScheme
    };
  }


  graficoUno() {
    this.Portal.obtenerUno()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoUno = data;
        const view = [400, 300];
        const xAxisLabel = 'Portales';
        const yAxisLabel = 'Salas';
        this.cGUno = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoDos(selectedOption: string) {
    this.datosGraficoDos = [];
    this.cGDos = "";
    this.equiposService.obtenerGuiaUno(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoDos = data;
        const view = [400, 300];
        const xAxisLabel = 'Salas';
        const yAxisLabel = 'Equipos';
        this.cGDos = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }


  graficoTres(selectedOption: string) {
    this.datosGraficoTres = [];
    this.cGTres = "";
    this.equiposService.obtenerGuiaDos(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoTres = data;
        const view = [400, 300];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGTres = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoCuatro(selectedOption: string) {
    this.datosGraficoCuatro = [];
    this.cGCuatro = "";
    this.equiposService.obtenerGuiaTres(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoCuatro = data;
        const view = [400, 300];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGCuatro = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoCinco(selectedOption: string) {
    this.datosGraficoCinco = [];
    this.cGCinco = "";
    this.equiposService.obtenerGuiaCuatro(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoCinco = data;
        const view = [400, 300];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGCinco = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoSeis(selectedOption: string) {
    this.datosGraficoSeis = [];
    this.cGSeis = "";
    this.equiposService.obtenerGuiaCinco(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoSeis = data;
        const view = [400, 300];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGSeis = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoSiete(selectedOption: string) {
    this.datosGraficoSiete = [];
    this.cGSiete = "";
    this.equiposService.obtenerGuiaSiete(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoSiete = data;
        const view = [400, 300];
        const xAxisLabel = 'Tipo de dispositivo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGSiete = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoOcho(selectedOption: string) {
    this.datosGraficoOcho = [];
    this.cGOcho = "";
    this.equiposService.obtenerGuiaSeis(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoOcho = data;
        const view = [400, 300];
        const xAxisLabel = 'Estado'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGOcho = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoNueve(selectedOption: string) {
    this.datosGraficoNueve = [];
    this.cGNueve = "";
    this.equiposService.obtenerGuiaOcho(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoNueve = data;
        const view = [400, 300];
        const xAxisLabel = 'Sistema Operativo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGNueve = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoDiez(selectedOption: string) {
    this.datosGraficoDiez = [];
    this.cGDiez = "";
    this.equiposService.obtenerGuiaNueve(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoDiez = data;
        const view = [400, 300];
        const xAxisLabel = 'Tipo de red'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGDiez = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoOnce(selectedOption) {
    this.datosGraficoOnce = [];
    this.cGOnce = "";
    this.equiposService.obtenerGuiaDiez(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoOnce = data;
        const view = [380, 300];
        const xAxisLabel = 'Sala'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Mantenimientos';
        this.cGOnce = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoDoce(selectedOption) {
    this.datosGraficoDoce = [];
    this.cGDoce = "";
    this.equiposService.obtenerGuiaOnce(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoDoce = data;
        const view = [380, 300];
        const xAxisLabel = 'Tipo de dispositivo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Mantenimientos';
        this.cGDoce = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);;
      });
  }

  graficoTrece(selectedOption) {
    this.datosGraficoTrece = [];
    this.cGTrece = "";
    this.equiposService.obtenerGuiaDoce(selectedOption)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoTrece = data;
        const view = [380, 300];
        const xAxisLabel = 'Tipo de dispositivo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Mantenimientos';
        this.cGTrece = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);;
      });
  }

}
