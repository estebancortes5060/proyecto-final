import { Component, OnInit } from '@angular/core';


import 'firebase/firestore';

import { AngularFirestore } from '@angular/fire/firestore';
import { EQUIPOS } from './db-data';

import { single } from './data'; // Importa los datos de ejemplo



@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent {


    single: any[];

    // Configuración del gráfico
    view: any[] = [400, 300];
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = 'Mes';
    showYAxisLabel: boolean = true;
    yAxisLabel: string = 'Ventas';
    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    };

    constructor() {
        Object.assign(this, { single });
    }

    ngOnInit(): void {
    }




}
















