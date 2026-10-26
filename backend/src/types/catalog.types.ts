import type {
  HomeResponse,
  RestaurantDto,
  FeaturedDishDto,
} from "./home.types";

/**
 * Respuesta estándar de una operación exitosa.
 */
export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

/**
 * Errores HTTP con formato uniforme.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields: Record<string, string>;
  };
}

/**
 * Restaurante presentado en el catálogo.
 */
export interface RestaurantCatalogDto extends RestaurantDto {
  imageUrl: string | null;
  category: string | null;
  estimatedDeliveryMinutes: number | null;
  rating: number | null;
}

/**
 * Platillo presentado en el catálogo o menú.
 */
export interface CatalogDishDto extends FeaturedDishDto {
  restaurantId: number;
  imageUrl: string | null;
  category: string | null;
  available: boolean;
}

/**
 * Menú de un restaurante.
 */
export interface RestaurantMenuDto {
  restaurant: RestaurantCatalogDto;
  dishes: CatalogDishDto[];
}

/**
 * Filtros admitidos para consultar el catálogo.
 */
export interface RestaurantCatalogQueryDto {
  search?: string;
  categoria?: string;
}

/**
 * Contratos de respuesta de Home y Catálogo.
 */
export type HomeApiResponse = ApiSuccessResponse<HomeResponse>;

export type RestaurantCatalogResponse =
  ApiSuccessResponse<RestaurantCatalogDto[]>;

export type RestaurantMenuResponse =
  ApiSuccessResponse<RestaurantMenuDto>;
