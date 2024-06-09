import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Equipo } from '../model/equipo';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import { Subscription } from 'rxjs';
import { PortalService } from '../services/portal.service';
import { UsuariosService } from '../services/usuarios.service';
import { Location } from '@angular/common';
import { EquiposService } from '../services/service.equipo';
import { Router } from '@angular/router';
import {AngularFireStorage} from '@angular/fire/storage';


@Component({
  selector: 'create-equipo',
  templateUrl: 'create-equipo.component.html',
  styleUrls: ['create-equipo.component.css']
})
export class CreateEquipoComponent implements OnInit {
  private portalesSubscription: Subscription;
  private rolSubscription: Subscription;
  private nombreUsuarioSubscription: Subscription;


  selectPortales: any;
  nombreUsuario: string;
  rol: string;
  portal: string;
  portales: any[];
  equipoId: string;
  partes: string[] = [];
  qrCodeData: string;
  salasPorPortal: number[] = [];
  salasArray: number[] = [];
  form = this.fb.group({
    descripcion: ['', Validators.required],
    tipoDispositivo: [null],
    sO: ['', Validators.required],
    estado: ['', Validators.required],
    tipoConRed: ['', Validators.required],
    modelo: ['', Validators.required],
    serie: ['', Validators.required],
    sala: ['', Validators.required],
    Maus: [false],
    Teclado: [false],
    Diadema: [false],
    Parlantes: [false],
    CPU: [false],
    Monitor: [false],
    Cargador: [false],
    selectPortales: ['']
  });
  constructor(
    private fb: FormBuilder,
    private Portal: PortalService,
    private equipoService: EquiposService,
    private afs: AngularFirestore,
    private router: Router,
    private storage: AngularFireStorage,
    private user: UsuariosService,
    private location: Location
  ) { }

  ngOnInit() {
    this.equipoId = this.afs.createId();

    this.portalesSubscription = this.Portal.getPortales().subscribe(portales => {
      this.portales = portales;
    });

    this.rolSubscription = this.user.getUserRol().subscribe(usuario => {
      this.rol = usuario.rol;
      this.portal = usuario.portal;
    });

    this.nombreUsuarioSubscription = this.user.nameUserLogged().subscribe(nombre => {
      this.nombreUsuario = nombre;
    });

  }

  

  getSelectedP() {
      const selectedPortalName = this.portal;
      return this.portales.find(portal => portal.nombrePortal === selectedPortalName);
    }
  
    getSalasPortal() {
      const equipoPortal = this.getSelectedP();
      if (equipoPortal && equipoPortal.salas) {
        this.salasArray = Array.from({ length: equipoPortal.salas }, (_, i) => i + 1);
      }
  }

  onCreateEquipo() {
    const val = this.form.value;
    const selectedPartes = [];

    if (val.Maus) {
      selectedPartes.push('Maus');
    }

    if (val.Teclado) {
      selectedPartes.push('Teclado');
    }

    if (val.Diadema) {
      selectedPartes.push('Diadema');
    }

    if (val.Parlantes) {
      selectedPartes.push('Parlantes');
    }

    if (val.CPU) {
      selectedPartes.push('CPU');
    }

    if (val.Monitor) {
      selectedPartes.push('Monitor');
    }

    if (val.Cargador) {
      selectedPartes.push('Cargador');
    }
    const equipoData = `
    Descripción: ${val.descripcion}
    Estado: ${val.estado}
    Modelo: ${val.modelo}
    SO: ${val.sO}
    Tipo de Dispositivo: ${val.tipoDispositivo}
    Tipo de Conexión a Red: ${val.tipoConRed}
    Categoria Portal: ${val.selectPortales}
    Serie: ${val.serie}
    Sala: ${val.sala}
    Partes: ${selectedPartes.join(', ')}
  `;

    QRCode.toDataURL(equipoData, (err, url) => {
      if (err) {
        console.error(err);
        return;
      }
      const newEquipo: Partial<Equipo> = {
        descripcion: val.descripcion,
        estado: val.estado,
        modelo: val.modelo,
        sO: val.sO,
        tipoDispositivo: val.tipoDispositivo,
        tipoConRed: val.tipoConRed,
        portalCategoria: val.selectPortales,
        serie: val.serie,
        sala: val.sala,
        partes: selectedPartes,
        url: url,
      };
      this.equipoService.createEquipo(newEquipo, this.equipoId)
        .pipe(
          tap(equipo => {

            const data = {
              equipoId: equipo.codigo,
              fecha: new Date().toLocaleDateString(),
              hora: new Date().toLocaleTimeString(),
              nombre: this.nombreUsuario,
              portal: equipo.portalCategoria,
              sala: equipo.sala,
              dispositivo: equipo.tipoDispositivo,
              serie: equipo.serie
            };
            
            this.equipoService.createRegistroCE(data).then(
              (docRef) => {
              },
              (error) => {
                console.error('Error al crear el registro:', error);
                // Manejo de errores si es necesario
              }
            );
            Swal.fire('Equipo Registrado correctamente', `Serie: ${equipo.serie}`, 'success');
            this.router.navigateByUrl("/main");
          }),
          catchError(err => {
            return throwError(err);
          })
        )
        .subscribe();
    });
  }
  volverPaginaAnterior() {
    this.location.back(); // Navega hacia atrás en el historial del navegador
  }
  resetCheckboxes() {
    // Restablece los valores de los checkboxes cuando cambia la selección
    this.form.patchValue({
      Maus: false,
      Teclado: false,
      Diadema: false,
      Parlantes: false,
      CPU: false,
      Monitor: false,
      Cargador: false
      // Restablece otros controles de checkbox aquí
    });
  }

  getSelectedPortal() {
    const selectedPortalName = this.form.get('selectPortales').value;
    return this.portales.find(portal => portal.nombrePortal === selectedPortalName);
  }
}

