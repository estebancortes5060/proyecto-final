export interface Usuarios {
    id: string,
    nombre: string;
    email: string;
    rol: string;
    portal: string;
    color?: string; 
    eliminable?: boolean; 
  }