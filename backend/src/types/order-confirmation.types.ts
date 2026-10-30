export interface OrderConfirmationItemDto {
  dishId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  co2SavedKg: number;
  packagingType: string;
}

export interface OrderConfirmationDto {
  id: number;
  date: string;
  status: string;
  total: number;
  zone: string;
  restaurant: {
    id: number;
    name: string;
  };
  items: OrderConfirmationItemDto[];
  environmentalImpact: {
    co2SavedKg: number;
  } | null;
}

export interface MyImpactDto {
  co2SavedKg: number;
  ordersCount: number;
}

export interface OrderConfirmationResponse {
  order: OrderConfirmationDto;
  myImpact: MyImpactDto;
}
