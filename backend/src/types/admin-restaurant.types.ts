export interface CreateAdminRestaurantInput {
  id_usuario_owner: number;
  nombre: string;
  direccion: string;
  latitud?: number | null;
  longitud?: number | null;
  envase_biodegradable: boolean;
  indicador_eco: string;
}

export interface UpdateAdminRestaurantInput {
  id_usuario_owner?: number;
  nombre?: string;
  direccion?: string;
  latitud?: number | null;
  longitud?: number | null;
  envase_biodegradable?: boolean;
  indicador_eco?: string;
}

export interface AdminRestaurantDto {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  biodegradablePackaging: boolean;
  ecoIndicator: string;
  active: boolean;
}
