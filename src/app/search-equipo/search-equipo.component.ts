import { Component, OnInit, OnDestroy } from '@angular/core';
import { Equipo } from '../model/equipo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { EquiposService } from '../services/service.equipo';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'search-equipo',
  templateUrl: './search-equipo.component.html',
  styleUrls: ['./search-equipo.component.css']
})
export class SearchEquipoComponet implements OnInit, OnDestroy {

  formulario: FormGroup;
  equiposList: Equipo[] = [];
  portal: string;
  rol: string;
  private subscription: Subscription = new Subscription();
  userSubscription: Subscription;

  constructor(
    private equiposService: EquiposService,
    private fb: FormBuilder,
    private location: Location,
    private user: UsuariosService,
  ) {
    this.formulario = this.fb.group({
      codigo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.user.getUserRol().subscribe(usuario => {
      this.portal = usuario.portal;
      this.rol = usuario.rol;
    });
  }

  buscarEquipo() {
    const codigo = this.formulario.value.codigo;
    if (codigo) {
      this.subscription.add(
        this.equiposService.buscarEquipos(codigo).subscribe((equipos) => {
          // Asignamos los equipos recuperados a la propiedad equiposList
          this.equiposList = equipos;
        })
      );
    }
  }

  buscarEquipoP() {
    const codigo = this.formulario.value.codigo;
    if (codigo) {
      this.subscription.add(
        this.equiposService.buscarEquiposP(codigo, this.portal).subscribe((equipos) => {
          // Asignamos los equipos recuperados a la propiedad equiposList
          this.equiposList = equipos;
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  volverPaginaAnterior() {
    this.location.back(); // Navega hacia atrás en el historial del navegador
  }
}