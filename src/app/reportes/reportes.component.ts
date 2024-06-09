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
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import html2canvas from 'html2canvas';



@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit, OnDestroy {

  @ViewChild('reporte') reporte!: ElementRef;


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

  portales: any[];
  selectedOption: string;
  selectedOptionD: string;
  selectedOptionUno: string;
  selectedOptionDos: string;
  selectedOptionTres: string;
  selectedOptionCuatro: string;
  selectedOptionCinco: string;
  selectedOptionSeis: string;

  fecha: string;

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
          this.graficoDos();
          this.graficoTres();
          this.graficoCuatro();
          this.graficoCinco();
          this.graficoSeis();
          this.graficoSiete();
          this.graficoOcho();
          this.graficoNueve();
          this.graficoDiez();
          this.graficoOnce();
          this.graficoDoce();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  downloadPDF() {
    const swalOptions = {
      title: '¿Desea descargar el PDF del reporte?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, descargar',
      cancelButtonText: 'Cancelar',
    };

    Swal.fire(swalOptions as any).then((result) => {
      if (result.isConfirmed) {
        // Obtener el contenido de cada parte del reporte
        const primeraParteElement = document.getElementById('primera-parte');
        const segundaParteElement = document.getElementById('segunda-parte');
        const terceraParteElement = document.getElementById('tercera-parte');
        const cuartaParteElement = document.getElementById('cuarta-parte');

        // Verificar si los elementos existen
        if (primeraParteElement && segundaParteElement && terceraParteElement && cuartaParteElement) {
          html2canvas(primeraParteElement).then((canvas1) => {
            html2canvas(segundaParteElement).then((canvas2) => {
              html2canvas(terceraParteElement).then((canvas3) => {
                html2canvas(cuartaParteElement).then((canvas4) => {
                  // Esperar 2 segundos antes de continuar
                  setTimeout(() => {
                    // Convertir los canvas a imágenes PNG
                    const imgData1 = canvas1.toDataURL('image/png');
                    const imgData2 = canvas2.toDataURL('image/png');
                    const imgData3 = canvas3.toDataURL('image/png');
                    const imgData4 = canvas4.toDataURL('image/png');

                    // Crear la definición del documento PDF
                    const docDefinition = {
                      content: [
                        { image: imgData1, width: 800, alignment: 'center', pageBreak: 'after' },
                        { image: imgData2, width: 600, alignment: 'center', pageBreak: 'after' },
                        { image: imgData3, width: 600, alignment: 'center', pageBreak: 'after' },
                        { image: imgData4, width: 600, alignment: 'center' }
                      ]
                    };

                    // Generar y descargar el PDF
                    pdfMake.createPdf(docDefinition).download('Reporte_Guia Tic_' + this.obtenerFechaActual() + '.pdf');
                  }, 30000); // Esperar 2 segundos
                });
              });
            });
          });
        } else {
          // Mostrar un mensaje de error si los elementos no existen
          Swal.fire({
            title: 'Error',
            text: 'No se encontró el contenido del reporte.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      }
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
    this.equiposService.obtenerGuiaUno(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoUno = data;
        const view = [450, 350];
        const xAxisLabel = 'Salas';
        const yAxisLabel = 'Equipos';
        this.cGUno = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });

  }

  graficoDos() {
    this.equiposService.obtenerGuiaDos(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoDos = data;
        const view = [450, 350];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGDos = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoTres() {
    this.equiposService.obtenerGuiaTres(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoTres = data;
        const view = [450, 350];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGTres = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoCuatro() {
    this.equiposService.obtenerGuiaCuatro(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoCuatro = data;
        const view = [450, 350];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGCuatro = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoCinco() {
    this.equiposService.obtenerGuiaCinco(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoCinco = data;
        const view = [450, 350];
        const xAxisLabel = 'Salas'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGCinco = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoSeis() {
    this.equiposService.obtenerGuiaSeis(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoSeis = data;
        const view = [450, 350];
        const xAxisLabel = 'Estado'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGSeis = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoSiete() {
    this.equiposService.obtenerGuiaSiete(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoSiete = data;
        const view = [450, 350];
        const xAxisLabel = 'Tipo de dispositivo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGSiete = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoOcho() {
    this.equiposService.obtenerGuiaOcho(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoOcho = data;
        const view = [450, 350];
        const xAxisLabel = 'Sistema Operativo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGOcho = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoNueve() {
    this.equiposService.obtenerGuiaNueve(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoNueve = data;
        const view = [450, 350];
        const xAxisLabel = 'Tipo de red'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Equipos';
        this.cGNueve = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoDiez() {
    this.equiposService.obtenerGuiaDiez(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoDiez = data;
        const view = [450, 350];
        const xAxisLabel = 'Serie Equipo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Mantenimientos';
        this.cGDiez = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoOnce() {
    this.equiposService.obtenerGuiaOnce(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoOnce = data;
        const view = [450, 350];
        const xAxisLabel = 'Sala'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Mantenimientos';
        this.cGOnce = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);
      });
  }

  graficoDoce() {
    this.equiposService.obtenerGuiaDoce(this.portal)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.datosGraficoDoce = data;
        const view = [450, 350];
        const xAxisLabel = 'Tipo de dispositivo'; // Nombre específico del eje X para el décimo gráfico
        const yAxisLabel = 'Mantenimientos';
        this.cGDoce = this.configurarOpcionesGrafico(view, xAxisLabel, yAxisLabel);;
      });
  }
}


