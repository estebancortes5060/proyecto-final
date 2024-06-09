import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColumnMappingService {

  private columnMapping = {
    'estado': 'ESTADO',
    'tipoConRed': 'TIPO DE RED',
    'portalCategoria': 'PORTAL',
    'sala': 'NUMERO SALA',
    'tipoDispositivo': 'DISPOSITIVO',
    'modelo': 'MODELO',
    'sO': 'SISTEMA OPERATIVO',
    'serie': 'SERIE',
    'descripcion': 'DESCRIPCION',
    'codigo': 'CODIGO',
    'url': 'URL'
  };

  constructor() { }

  getMappedColumnName(columnName: string): string {
    return this.columnMapping[columnName] || columnName;
  }
}