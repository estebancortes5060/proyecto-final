import { Component, OnDestroy, OnInit } from '@angular/core';
import { Equipo } from '../model/equipo';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquiposService } from '../services/service.equipo';
import { PortalService } from '../services/portal.service';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  consulta: string = '';
  portales: any[];
  rol: string;
  userportal: string;
  portalEquipos: { [nombrePortal: string]: Equipo[][] } = {};
  mostrarSalas: { [sala: number]: boolean } = {};
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private equiposService: EquiposService,
    private Portal: PortalService,
    private user: UsuariosService
  ) { }

  toggleSala(sala: number) {
    this.mostrarSalas[sala] = !this.mostrarSalas[sala];
    for (let key in this.mostrarSalas) {
      if (key !== sala.toString()) {
        this.mostrarSalas[key] = false;
      }
    }
  }

  ngOnInit() {
    this.user.getUserRol().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(usuario => {
      this.rol = usuario.rol;
      this.userportal = usuario.portal;
    });

    this.Portal.getPortales().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(portales => {
      this.portales = portales;
      this.reloadEquipos();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isAllowed(portal: any): boolean {
    return this.rol === 'Guia Tic' ? portal.nombrePortal === this.userportal : true;
  }

  reloadEquipos() {
    this.portales.forEach(portal => {
      for (let sala = 1; sala <= portal.salas; sala++) {
        this.equiposService.loadEquiposByCategory(portal.nombrePortal, sala)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(equipos => {
            if (!this.portalEquipos[portal.nombrePortal]) {
              this.portalEquipos[portal.nombrePortal] = [];
            }
            this.portalEquipos[portal.nombrePortal][sala - 1] = equipos;
          });
      }
    });
  }
  

  getSalas(totalSalas: number): number[] {
    return Array(totalSalas).fill(0).map((x, i) => i + 1);
  }

  getSelectedPortal() {
    return this.portales.find(portal => portal.nombrePortal === this.userportal);
  }
}
