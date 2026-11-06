export interface CreateAdminDishInput {
  id_restaurante: number;
  nombre: string;
  precio: number;
  co2_ahorrado_unit: number;
}

export interface UpdateAdminDishInput {
  id_restaurante?: number;
  nombre?: string;
  precio?: number;
  co2_ahorrado_unit?: number;
}

export interface AdminDishDto {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  co2SavedPerUnit: number;
  available: boolean;
}
