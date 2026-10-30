export interface CheckoutItemInput {
  dishId: number;
  quantity: number;
}

export interface CheckoutRequest {
  restaurantId: number;
  zone: string;
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
  restaurantId: number;
  restaurantName: string;
  zone: string;
  items: CheckoutItemDto[];
  subtotal: number;
  deliveryFee: null;
  total: null;
  environmentalImpact: null;
  requiresEnvironmentalRules: true;
}
