import type { DeliveryDestination } from "../services/delivery.service";
export interface CheckoutItemInput {
  dishId: number;
  quantity: number;
}

export interface CheckoutRequest {
  restaurantId: number;
  destination: DeliveryDestination;
  items: CheckoutItemInput[];
}

export interface CheckoutItemDto {
  dishId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutQuoteDto {
  deliveryToken?: string;
  destination: DeliveryDestination;
  distanceKm: number;
  methodology: string;
  restaurantId: number;
  restaurantName: string;
  zone: string;
  items: CheckoutItemDto[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  environmentalImpact: { co2SavedKg: number };
  requiresEnvironmentalRules: false;
}
