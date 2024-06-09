import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Equipo} from "../model/equipo";
import {EquiposService} from "./service.equipo";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root"
})
export class EquipoResolver implements Resolve<Equipo>{

    constructor(private equiposService: EquiposService) {}

    resolve(route: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): Observable<Equipo> {

        const equipoUrl = route.paramMap.get("equipoUrl");

        return this.equiposService.findEquipoByUrl(equipoUrl);
    }

}